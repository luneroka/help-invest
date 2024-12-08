from flask import request, jsonify, redirect, render_template, flash, session
from config import app, db
from models import Users, Categories, Portfolios
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import validate_password_strength, login_required, serialize_category, register_error_handlers
from datetime import datetime

# CSRF Error handler (by ChatGPT)
register_error_handlers(app)

@app.route("/login", methods=["GET", "POST"])
def login():
  if request.method == "POST":
    # Retrieve form data
    username = request.form.get("username")
    password = request.form.get("password")

    # Validate input
    if not username:
      flash("Username is required", "error")
      return render_template("login.html"), 403
  
    if not password:
      flash("Password is required", "error")
      return render_template("login.html"), 403
    
    # Query database for username
    user = Users.query.filter_by(username=username).first()

    # Validate username and password
    if not user or not check_password_hash(user.hash, password):
      flash("Invalid username or password", "error")
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

    # Validate username input
    if not username:
      flash("Username is required", "error")
      return render_template("signup.html"), 400
  
    # Validate password input
    if not password:
      flash("Password is required", "error")
      return render_template("signup.html"), 400
    
    # Validate password strength (100% ChatGPT)
    password_error = validate_password_strength(password)
    if password_error:
      flash(password_error, "error")
      return render_template("signup.html"), 400
    
    # Validate other input
    if not confirmation:
      flash("Must confirm password", "error")
      return render_template("signup.html"), 400
    
    if confirmation != password:
      flash("Passwords do not match", "error")
      return render_template("signup.html"), 400
    
    # Check if username already exists
    existing_user = Users.query.filter_by(username=username).first()
    if existing_user:
      flash("Username already exists", "error")
      return render_template("signup.html"), 400
    
    # Hash password and create new user
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    new_user = Users(username=username, hash=hashed_password, risk_profile="medium")

    # Try adding new user to db
    try:
      db.session.add(new_user)
      db.session.commit()
      flash("You account has been successfuly created", "success")
      return redirect("/login")
    except Exception as e:
      db.session.rollback()
      flash("An error has occurred. Please try again", "error")
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
        flash("Current password is required", "error")
        return render_template("change-password.html"), 400
    
    if not new_password:
        flash("New password is required", "error")
        return render_template("change-password.html"), 400
      
    if not confirmation:
      flash("Must confirm new password", "error")
      return render_template("change-password.html"), 400
    
    if confirmation != new_password:
      flash("Passwords do not match", "error")
      return render_template("change-password.html"), 400
    
    # Validate password strength (100% ChatGPT)
    password_error = validate_password_strength(new_password)
    if password_error:
      flash(password_error, "error")
      return render_template("change-password.html"), 400
    
    # Retrieve user
    user = Users.query.filter_by(id=session['user_id']).first()

    # Validate current password
    if not user or not check_password_hash(user.hash, current_password):
        flash("Current password is invalid", "error")
        return render_template("change-password.html"), 400
    
    # Check if new password is different from current password
    if check_password_hash(user.hash, new_password):
      flash("New password must be different from current password", "error")
      return render_template("change-password.html"), 400
    
    # Hash new password
    new_hashed_password = generate_password_hash(new_password,  method='pbkdf2:sha256', salt_length=16)

    # Try updating users table with new password
    try:
      user.hash = new_hashed_password
      db.session.commit()
      session.clear()
      flash("Your password was successfuly updated! Please log back in.", "success")
      return redirect("/login")
    except Exception as e:
        db.session.rollback()
        flash("An error has occurred. Please try again", "error")
        return render_template("/change-password.html"), 500
  
  return render_template("change-password.html")


@app.route("/")
def index():
   return render_template("index.html")


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
        entry_time = datetime.utcnow()

        # Validate input
        try:
            amount = float(amount)
        except ValueError:
            flash("Invalid amount")
            return redirect("/add-entry")

        if not category_name or not sub_category:
            flash("Both category and sub-category are required", "error")
            return redirect("/add-entry")

        # Query for the category
        category_query = Categories.query.filter_by(name=category_name, sub_category=sub_category).first()
        if not category_query:
            flash("The selected category and sub-category combination does not exist.", "error")
            return redirect("/add-entry")
        
        # Create and save the new entry
        category_id = category_query.id
        new_entry = Portfolios(user_id=user_id, category_id=category_id, amount=amount, entry_time=entry_time)
        try:
            db.session.add(new_entry)
            db.session.commit()
            flash("Investment added successfully!", "success")
            return redirect("/dashboard")
        except Exception as e:
            db.session.rollback()
            flash("An error occurred while adding the entry.", "error")
            return redirect("/dashboard")

    # Get unique categories and all categories
    distinct_categories = Categories.query.with_entities(Categories.name).distinct().all()
    all_categories = [serialize_category(cat) for cat in Categories.query.all()]

    return render_template("add-entry.html",
                           categories=distinct_categories,
                           all_categories=all_categories)



@app.route("/history")
@login_required
def view_history():
  # Retrieve data for table
  user_id = session['user_id']

  page = request.args.get('page', 1, type=int) # ChatGPT
  per_page = 10
  portfolio_entries = db.session.query(Portfolios, Categories).join(Categories, Portfolios.category_id == Categories.id).filter(Portfolios.user_id == user_id).order_by(Portfolios.entry_time.desc())

  # Apply pagination
  pagination = portfolio_entries.paginate(page=page, per_page=per_page, error_out=False)

  if not portfolio_entries:
     flash("No history entries found", "info")
     return redirect("/dashboard")
  
  # Create a dictionary to hold table data
  portfolio_history = [
    {
    "id": entry.Portfolios.id,
    "category_name": entry.Categories.name,
    "sub_category_name": entry.Categories.sub_category,
    "amount": entry.Portfolios.amount,
    "entry_time": entry.Portfolios.entry_time.strftime('%Y-%m-%d %H:%M:%S')
    }
    for entry in pagination.items
  ]

  return render_template("history.html", portfolio_history=portfolio_history, pagination=pagination)


@app.route("/delete-entry", methods=["POST"])
@login_required
def delete_entry():
  # Retrieve entry id from the form
  entry_id = request.form.get("entry_id")

  if not entry_id:
      flash("Invalid entry ID", "error")
      return redirect("/history")
  
  # Retrieve portfolio entry by id
  entry = Portfolios.query.filter_by(id=entry_id, user_id=session['user_id']).first()

  if not entry:
      flash("Entry not found or user does not have permission to delete", "error")
      return redirect("/history")
  
  # Update db
  try:
      # Delete entry from db
      db.session.delete(entry)
      db.session.commit()
      flash("Entry successfully deleted", "success")
  except Exception as e:
     db.session.rollback()
     flash("An error has occurred while deleting the entry. Please try again", "error")
  
  # Redirect to history page
  return redirect("/history")


if __name__ == "__main__":
  # Instantiate db
  with app.app_context():
    db.create_all()

  app.run(debug=True) # Turn to False when deploying