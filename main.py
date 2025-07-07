from flask import request, redirect, render_template, flash, session
from config import app, db
from models import *
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import validate_password_strength, login_required, serialize_category, register_error_handlers
from datetime import datetime

# CSRF Error handler
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
    
    # Validate password strength
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
    new_user = Users(username=username, hash=hashed_password, risk_profile="moderate")

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
    
    # Validate password strength
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


@app.route("/risk-profile", methods=["GET", "POST"])
@login_required
def risk_profile():
   user_id = session['user_id']

   # Handle POST method
   if request.method == "POST":
      user_risk_profile = request.form.get("risk")
      if not user_risk_profile:
         flash("Please select a risk profile from the dropdown list.", "error")
         return redirect("/risk-profile")

      # Change valid input to lower case
      new_profile = user_risk_profile.lower()
      
      # Retrieve user
      user = db.session.query(Users).filter(Users.id == user_id).first()

      # Update db
      try:
         user.risk_profile = new_profile
         db.session.commit()
         flash("Your risk profile was updated successfully", "success")
         return redirect("/risk-profile")
      except Exception as e:
         db.session.rollback()
         flash("An error has occurred. Your risk profile could not be updated", "error")
         return redirect("/risk-profile")
         
  
   # Fetch current risk profile
   user = db.session.query(Users).filter(Users.id == user_id).first()
   current_profile = user.risk_profile.upper()
   return render_template("risk-profile.html", current_profile=current_profile)


@app.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
  # Display portfolio data
  user_id = session['user_id']
  
  # Query user balances
  portfolio_data = db.session.query(
     Portfolios.balance, Categories.name, Categories.sub_category
  ).join(Categories, Portfolios.category_id == Categories.id).filter(Portfolios.user_id == user_id).all()

  # Initialize total estate and portfolio summary
  total_estate = 0
  portfolio_summary = {}

  for balance, category_name, sub_category_name in portfolio_data:
      # Skip categories with 0 balance
      if balance == 0:
         continue
      
      # Add balance to total estate
      total_estate += balance
        
     # Initialize category structure
      if category_name not in portfolio_summary:
       portfolio_summary[category_name] = {'total_balance': 0, 'sub_categories': {}}

     # Update total balance for the category
      portfolio_summary[category_name]['total_balance'] += balance

     # Update balance of sub-category
      if sub_category_name not in portfolio_summary[category_name]['sub_categories']:
        portfolio_summary[category_name]['sub_categories'][sub_category_name] = 0
      portfolio_summary[category_name]['sub_categories'][sub_category_name] += balance

  # Filter out any categories with a total balance of zero
  portfolio_summary = {category: details for category, details in portfolio_summary.items() if details['total_balance'] > 0}

  # Display recommendation

  # Handle empty portfolio
  if total_estate == 0:
      flash("Your portfolio is empty. Start building your wealth!", "info")
      return render_template("dashboard.html", portfolio_summary={}, total_estate=0, portfolio_analysis=[])
  
  # Fetch user's risk profile
  user = db.session.query(Users).filter(Users.id == user_id).first()
  risk_profile = user.risk_profile

  # Define default repartition based on risk profiles
  risk_profiles = {
     'conservative': {'Savings': 0.5, 'Real Estate': 0.3, 'Stocks': 0.2},
     'aggressive': {'Savings': 0.05, 'Real Estate': 0.15, 'Stocks': 0.8},
     'moderate': {'Savings': 0.25, 'Real Estate': 0.25, 'Stocks': 0.5},
  }

  # Set default profile
  reco_percentages = risk_profiles.get(risk_profile, risk_profiles['moderate'])

  # Calculate current and recommended totals dymanically
  current_totals = {category: details['total_balance'] for category, details in portfolio_summary.items()}
  reco_totals = {category: total_estate * reco_percentages.get(category, 0) for category in portfolio_summary.keys()}

  # Merge all portfolio data in a single list of dictionaries for easier rendering
  portfolio_analysis = [
    {
        'category': category,
        'current_balance': current_totals.get(category, 0),
        'current_percentage': current_totals.get(category, 0) / total_estate if total_estate > 0 else 0,
        'recommended_balance': reco_totals.get(category, 0),
        'recommended_percentage': reco_percentages.get(category, 0),
        'gap': reco_totals.get(category, 0) - current_totals.get(category, 0),
    }
    for category in portfolio_summary.keys()
  ]
  
  # Render template
  return render_template("dashboard.html", portfolio_summary=portfolio_summary, total_estate=total_estate, portfolio_analysis=portfolio_analysis)



@app.route("/add-entry", methods=["GET", "POST"])
@login_required
def add_entry():
    if request.method == "POST":
        # Retrieve form data
        user_id = session['user_id']
        category_name = request.form.get("category-name")
        sub_category = request.form.get("sub-category")
        amount = request.form.get("amount")
        timestamp = datetime.utcnow()

        # Validate input
        try:
            amount = float(amount)
            if amount == 0:
                flash("Amount cannot be zero.", "error")
                return redirect("/add-entry")
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
        new_entry = Transactions(user_id=user_id, category_id=category_id, amount=amount, timestamp=timestamp)
        try:
            db.session.add(new_entry)

            # Update balance in Portfolios table
            portfolio = Portfolios.query.filter_by(user_id=user_id, category_id=category_id).first()
            if portfolio:
               portfolio.balance += amount
            else:
               portfolio = Portfolios(user_id=user_id, category_id=category_id, balance=amount)
               db.session.add(portfolio)
            
            # Commit changes
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


@app.route("/withdraw", methods=["GET", "POST"])
@login_required
def withdraw():
    user_id = session["user_id"]

    if request.method == "POST":
        # Retrieve and validate user input
        category_name = request.form.get("category-name")
        sub_category_name = request.form.get("sub-category")
        try:
            withdraw_amount = float(request.form.get("amount"))
        except ValueError:
            flash("Invalid amount. Please enter a numeric value.", "error")
            return redirect("/withdraw")

        if not category_name or not sub_category_name or withdraw_amount <= 0:
            flash("Invalid input. Please try again.", "error")
            return redirect("/withdraw")
        
        # Retrieve category ID and current balance
        category_query = (
           db.session.query(Categories)
           .filter_by(name=category_name, sub_category=sub_category_name)
           .first()
        )     
        if not category_query:
            flash("The selected category and sub-category combination does not exist.", "error")
            return redirect("/withdraw")

        category_id = category_query.id

        # Fetch the current balance for the category
        portfolio_entry = (
            db.session.query(Portfolios)
            .filter_by(user_id=user_id, category_id=category_id)
            .first()
        )

        if not portfolio_entry or portfolio_entry.balance < withdraw_amount:
            flash("Insufficient balance.", "error")
            return redirect("/withdraw")

        # Deduct the withdrawal amount from the portfolio balance
        portfolio_entry.balance -= withdraw_amount

        # Log the withdrawal as a negative transaction
        withdrawal_transaction = Transactions(
            user_id=user_id,
            category_id=category_id,
            amount=-withdraw_amount,  # Negative amount indicates withdrawal
            timestamp=datetime.utcnow(),
        )
        try:
            db.session.add(withdrawal_transaction)
            db.session.commit()
            flash("Withdrawal successful!", "success")
            return redirect("/dashboard")
        except Exception as e:
            db.session.rollback()
            flash("An error occurred while processing your withdrawal. Please try again.", "error")
            return redirect("/withdraw")

    # Aggregate categories and sub-categories with their total balances
    withdraw_categories = (
        db.session.query(
            Categories.name, Categories.sub_category, Portfolios.balance
        )
        .join(Portfolios, Categories.id == Portfolios.category_id)
        .filter(Portfolios.user_id == user_id, Portfolios.balance > 0)
        .all()
    )

    # Transform data for the frontend
    distinct_categories = sorted(set([cat.name for cat in withdraw_categories]))
    withdraw_categories_data = [
        {
            "category": entry.name,
            "sub_category": entry.sub_category,
            "balance": entry.balance,
        }
        for entry in withdraw_categories
    ]

    return render_template(
        "withdraw.html",
        distinct_categories=distinct_categories,
        withdraw_categories=withdraw_categories_data,
    )


@app.route("/history")
@login_required
def view_history():
  # Retrieve data for table
  user_id = session['user_id']

  page = request.args.get('page', 1, type=int)
  per_page = 10

  # Query user's transactions
  transaction_entries = db.session.query(
     Transactions, Categories.name.label("category_name"), Categories.sub_category.label("sub_category_name")
     ).join(Categories, Transactions.category_id == Categories.id).filter(Transactions.user_id == user_id).order_by(Transactions.timestamp.desc())

  # Apply pagination
  pagination = transaction_entries.paginate(page=page, per_page=per_page, error_out=False)

  if not transaction_entries:
     flash("No transaction history found", "info")
     return redirect("/dashboard")
  
  # Create a dictionary to hold table data
  transaction_history = [
    {
    "id": entry.Transactions.id,
    "category_name": entry.category_name,
    "sub_category_name": entry.sub_category_name,
    "amount": entry.Transactions.amount,
    "timestamp": entry.Transactions.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    }
    for entry in pagination.items
  ]

  return render_template("history.html", portfolio_history=transaction_history, pagination=pagination)


@app.route("/delete-entry", methods=["POST"])
@login_required
def delete_entry():
  # Retrieve entry id from the form
  entry_id = request.form.get("entry_id")

  if not entry_id: 
      flash("Invalid entry ID", "error")
      return redirect("/history")
  
  # Retrieve portfolio transaction by id
  transaction = Transactions.query.filter_by(id=entry_id, user_id=session['user_id']).first()

  if not transaction:
      flash("Transaction not found or user does not have permission to delete", "error")
      return redirect("/history")
  
  # Calculate corresponding portfolio entry
  portfolio_entry = Portfolios.query.filter_by(user_id=session['user_id'], category_id=transaction.category_id).first()

  if not portfolio_entry:
      flash("Portfolio entry not found", "error")
      return redirect("/history")
  
  # Adjust portfolio balance based on transaction type (positive or negative)
  try:
      # Update portfolio balance
      portfolio_entry.balance -= transaction.amount

      # Delete the transaction entry
      db.session.delete(transaction)

      # Commit changes to both tables
      db.session.commit()

      flash("Transaction successfully deleted", "success")
  except Exception as e:
      db.session.rollback()
      flash("An error has occurred while deleting the transaction. Please try again.", "error")
  
  # Redirect to history page
  return redirect("/history")


if __name__ == "__main__":
  # Instantiate db
  with app.app_context():
    db.create_all()

  app.run(debug=True) # Turn to False when deploying