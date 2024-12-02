from flask import request, jsonify, redirect, render_template, flash, session
from config import app, db
from models import Users, Categories, Portfolios
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import validate_password_strength, login_required

@app.route("/login", methods=["GET", "POST"])
def login():
  if request.method == "POST":
    # Retrieve form data
    username = request.form.get("username")
    password = request.form.get("password")

    # Validate input
    if not username:
      flash("Username is required")
      return render_template("login.html"), 403
  
    if not password:
      flash("Password is required")
      return render_template("login.html"), 403
    
    # Query database for username
    user = Users.query.filter_by(username=username).first()

    # Validate username and password
    if not user or not check_password_hash(user.hash, password):
      flash("Invalid username or password")
      return render_template("login.html"), 403
    
    # Log the use in
    session.clear()
    session["user_id"] = user.id
      
    # Redirect user to dashboard
    return redirect("/dashboard")
  
  return render_template("login.html")


@app.route("/logout")
def logout():
  session.clear()
  return redirect("/")


@app.route("/signup", methods=["GET", "POST"])
def signup():
  if request.method == "POST":
    # Retrieve form data
    username = request.form.get("username")
    password = request.form.get("password")
    confirmation = request.form.get("confirmation")

    # Validate password input
    if not password:
      flash("Password is required")
      return render_template("signup.html"), 400
    
    # Validate password strength (100% ChatGPT)
    password_error = validate_password_strength(password)
    if password_error:
      flash(password_error)
      return render_template("signup.html"), 400
    
    # Validate other input
    if not confirmation:
      flash("Must confirm password")
      return render_template("signup.html"), 400
    
    if confirmation != password:
      flash("Passwords do not match")
      return render_template("signup.html"), 400
    
    if not username:
      flash("Username is required")
      return render_template("signup.html"), 400
  
    # Check if username already exists
    existing_user = Users.query.filter_by(username=username).first()
    if existing_user:
      flash("Username already exists")
      return render_template("signup.html"), 400
    
    # Hash password and create new user
    hashed_password = generate_password_hash(password)
    new_user = Users(username=username, hash=hashed_password, risk_profile="medium")

    # Try adding new user to db
    try:
      db.session.add(new_user)
      db.session.commit()
      flash("You account has been successfuly created")
      return redirect("/login")
    except Exception as e:
      db.session.rollback()
      flash("An error has occurred. Please try again")
      return render_template("/signup.html"), 500
  
  return render_template("signup.html")


@app.route("/change-password", methods=["GET", "POST"])
@login_required
def change_password():
  if request.method == "POST":
    # Retrieve form data
    current_password = request.form.get("current-password")
    new_password = request.form.get("new-password")
    confirmation = request.form.get("confirmation")

    # Validate input
    if not current_password:
        flash("Current password is required")
        return render_template("change-password.html"), 400
    
    if not new_password:
        flash("New password is required")
        return render_template("change-password.html"), 400
      
    if not confirmation:
      flash("Must confirm new password")
      return render_template("change-password.html"), 400
    
    if confirmation != new_password:
      flash("Passwords do not match")
      return render_template("change-password.html"), 400
    
    # Validate password strength (100% ChatGPT)
    password_error = validate_password_strength(new_password)
    if password_error:
      flash(password_error)
      return render_template("change-password.html"), 400
    
    # Retrieve user
    user = Users.query.filter_by(id=session['user_id']).first()

    # Validate current password
    if not user or not check_password_hash(user.hash, current_password):
        flash("Current password is invalid")
        return render_template("change-password.html"), 400
    
    # Check if new password is different from current password
    if check_password_hash(user.hash, new_password):
      flash("New password must be different from current password")
      return render_template("change-password.html"), 400
    
    # Hash new password
    new_hashed_password = generate_password_hash(new_password)

    # Try updating users table with new password
    try:
      user.hash = new_hashed_password
      db.session.commit()
      flash("Your password was successfuly updated. Please log back in.")
      session.clear()
      return redirect("/login")
    except Exception as e:
        db.session.rollback()
        flash("An error has occurred. Please try again")
        return render_template("/change-password.html"), 500
  
  return render_template("/change-password.html")


@app.route("/dashboard", methods=["GET"])
def dashboard():
  # Display portfolio data
  user_id = session['user_id']
  portfolio_entries = db.session.query(Portfolios, Categories).join(Categories).filter(Portfolios.user_id == user_id).all()

  # Create a dictionary to hold categories and sub-categories with total amounts
  portfolio_summary = {}

  # Loop through portfolio entries
  for entry in portfolio_entries:
    category_name = entry.Categories.name
    sub_category_name = entry.Categories.sub_category
    amount = entry.Portfolios.amount

    # If category doesn't exist in dictionary, initialize it
    if category_name not in portfolio_summary:
      portfolio_summary[category_name] = {'total_amount': 0, 'sub_categories': {}}
    
    # Add amount to category total
    portfolio_summary[category_name]['total_amount'] += amount

    # If sub-category doesn't exist, initialize it
    if sub_category_name not in portfolio_summary[category_name]['sub_categories']:
      portfolio_summary[category_name]['sub_categories'][sub_category_name] = 0
    
    # Add amount to sub-category total
    portfolio_summary[category_name]['sub_categories'][sub_category_name] += amount

# Prepare the data to be passed into the template
  return render_template("dashboard.html", portfolio_summary=portfolio_summary)


@app.route("/add-entry", methods=["GET", "POST"])
@login_required
def add_entry():
  if request.method == "POST":
    # Retrieve form data
    user_id = session['user_id']
    category_name = request.form.get("category-name")
    sub_category = request.form.get("sub-category")
    amount = request.form.get("amount")

    # Convert amount to float
    try:
      amount = float(amount)
    except ValueError:
      flash("Invalid amount")
      return redirect("/add-entry")

    # Validate category and sub-category input
    if not category_name:
      flash("Please select a category for your investment")
      return redirect("/add-entry")

    if not sub_category:
      flash("Please select a sub-category for your investment")
      return redirect("/add-entry")

    # Query the Categories table to get category_id
    category_query = Categories.query.filter_by(name=category_name, sub_category=sub_category).first()

    # Handle error if category_id could not be found
    if not category_query:
      flash("The selected category and sub-category combination does not exist.")
      return redirect("/add-entry")
    
    # Get the category_id
    category_id = category_query.id

    # Create new portfolio entry
    new_entry = Portfolios(user_id=user_id, category_id=category_id, amount=amount)

    try:
      db.session.add(new_entry)
      db.session.commit()
      flash("Investment added successfully!")
      return redirect("/dashboard")
    except Exception as e:
      db.session.rollback()
      flash("An error has occurred. Entry could not be added.")
      return redirect("/dashboard")

  # Retrieve all categories and sub-categories for the form
  categories = Categories.query.all()
  return render_template("add-entry.html", categories=categories)


if __name__ == "__main__":
  # Instantiate db
  with app.app_context():
    db.create_all()

  app.run(debug=True) # Turn to False when deploying