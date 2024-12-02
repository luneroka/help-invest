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


if __name__ == "__main__":
  # Instantiate db
  with app.app_context():
    db.create_all()

  app.run(debug=True) # Turn to False when deploying


