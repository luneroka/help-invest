from flask import request, redirect, render_template, flash, session, jsonify, make_response
from .config import app, db
from .models import Users, Categories, Portfolios, Transactions
from werkzeug.security import check_password_hash, generate_password_hash
from .helpers import (
    validate_password_strength,
    login_required,
    serialize_category,
    register_error_handlers,
)
from datetime import datetime

# CSRF Error handler
# register_error_handlers(app)


@app.route("/api/login", methods=["POST"])
def login():
    try:
        # Check if request contains JSON
        if not request.is_json:
            print("Request is not JSON")
            return jsonify({
                "success": False,
                "message": "Content-Type must be application/json"
            }), 400

        data = request.get_json()
        print(f"Parsed JSON: {data}")

        if not data:
            print("No data in request")
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Retrieve form data
        username = data.get("username")
        password = data.get("password")

        # Validate input
        if not username:
            return jsonify({
                "success": False,
                "message": "Nom d'utilisateur requis"
            }), 400

        if not password:
            return jsonify({
                "success": False,
                "message": "Mot de passe requis"
            }), 400

        # Query database for username
        user = Users.query.filter_by(username=username).first()

        # Validate username and password
        if not user or not check_password_hash(user.hash, password):
            return jsonify({
                "success": False,
                "message": "Nom d'utilisateur ou mot de passe incorrect"
            }), 401

        # Log the user in
        session.clear()
        session["user_id"] = user.id

        # Return success with user data
        return jsonify({
            "success": True,
            "message": "Connexion réussie",
            "user": {
                "id": user.id,
                "username": user.username,
                "risk_profile": user.risk_profile
            }
        }), 200

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


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
            flash("Nom d'utilisateur requis", "error")
            return render_template("signup.html"), 400

        # Validate password input
        if not password:
            flash("Mot de passe requis", "error")
            return render_template("signup.html"), 400

        # Validate password strength
        password_error = validate_password_strength(password)
        if password_error:
            flash(password_error, "error")
            return render_template("signup.html"), 400

        # Validate other input
        if not confirmation:
            flash("Veuillez confirmer votre mot de passe", "error")
            return render_template("signup.html"), 400

        if confirmation != password:
            flash("Les mots de passe ne correspondent pas", "error")
            return render_template("signup.html"), 400

        # Check if username already exists
        existing_user = Users.query.filter_by(username=username).first()
        if existing_user:
            flash("Ce nom d'utilisateur existe déjà", "error")
            return render_template("signup.html"), 400

        # Hash password and create new user
        hashed_password = generate_password_hash(
            password, method="pbkdf2:sha256", salt_length=16
        )
        new_user = Users(
            username=username, hash=hashed_password, risk_profile="Équilibré"
        )

        # Try adding new user to db
        try:
            db.session.add(new_user)
            db.session.commit()
            flash("Votre compte a été créé avec succès", "success")
            return redirect("/login")
        except Exception as e:
            db.session.rollback()
            flash("Une erreur s'est produite. Veuillez réessayer", e)
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
            flash("Mot de passe actuel requis", "error")
            return render_template("change-password.html"), 400

        if not new_password:
            flash("Nouveau mot de passe requis", "error")
            return render_template("change-password.html"), 400

        if not confirmation:
            flash("Veuillez confirmer le nouveau mot de passe", "error")
            return render_template("change-password.html"), 400

        if confirmation != new_password:
            flash("Les mots de passe ne correspondent pas", "error")
            return render_template("change-password.html"), 400

        # Validate password strength
        password_error = validate_password_strength(new_password)
        if password_error:
            flash(password_error, "error")
            return render_template("change-password.html"), 400

        # Retrieve user
        user = Users.query.filter_by(id=session["user_id"]).first()

        # Validate current password
        if not user or not check_password_hash(user.hash, current_password):
            flash("Le mot de passe actuel est invalide", "error")
            return render_template("change-password.html"), 400

        # Check if new password is different from current password
        if check_password_hash(user.hash, new_password):
            flash(
                "Le nouveau mot de passe doit être différent de l'ancien", "error"
            )
            return render_template("change-password.html"), 400

        # Hash new password
        new_hashed_password = generate_password_hash(
            new_password, method="pbkdf2:sha256", salt_length=16
        )

        # Try updating users table with new password
        try:
            user.hash = new_hashed_password
            db.session.commit()
            session.clear()
            flash(
                "Votre mot de passe a été mis à jour avec succès ! Veuillez vous reconnecter",
                "success",
            )
            return redirect("/login")
        except Exception as e:
            db.session.rollback()
            flash("Une erreur s'est produite. Veuillez réessayer", e)
            return render_template("/change-password.html"), 500

    return render_template("change-password.html")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/risk-profile", methods=["GET", "POST"])
@login_required
def risk_profile():
    user_id = session["user_id"]

    # Handle POST method
    if request.method == "POST":
        user_risk_profile = request.form.get("risk")
        if not user_risk_profile:
            flash(
                "Veuillez sélectionner un profil de risque dans la liste déroulante", "error"
            )
            return redirect("/risk-profile")

        # Change valid input to lower case
        new_profile = user_risk_profile.lower()

        # Retrieve user
        user = db.session.query(Users).filter(Users.id == user_id).first()

        # Update db
        try:
            user.risk_profile = new_profile
            db.session.commit()
            flash("Votre profil de risque a été mis à jour avec succès", "success")
            return redirect("/risk-profile")
        except Exception as e:
            db.session.rollback()
            flash(
                "Une erreur s'est produite. Votre profil de risque n'a pas pu être mis à jour",
                e,
            )
            return redirect("/risk-profile")

    # Fetch current risk profile
    user = db.session.query(Users).filter(Users.id == user_id).first()
    current_profile = user.risk_profile.upper()
    return render_template(
        "risk-profile.html", current_profile=current_profile
    )


@app.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
    # Display portfolio data
    user_id = session["user_id"]

    # Query user balances
    portfolio_data = (
        db.session.query(
            Portfolios.balance,
            Categories.category_name,
            Categories.sub_category
        )
        .join(Categories, Portfolios.category_id == Categories.id)
        .filter(Portfolios.user_id == user_id)
        .all()
    )

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
            portfolio_summary[category_name] = {
                "total_balance": 0,
                "sub_categories": {},
            }

        # Update total balance for the category
        portfolio_summary[category_name]["total_balance"] += balance

        # Update balance of sub-category
        if (
            sub_category_name
            not in portfolio_summary[category_name]["sub_categories"]
        ):
            portfolio_summary[category_name]["sub_categories"][
                sub_category_name
            ] = 0
        portfolio_summary[category_name]["sub_categories"][
            sub_category_name
        ] += balance

    # Filter out any categories with a total balance of zero
    portfolio_summary = {
        category: details
        for category, details in portfolio_summary.items()
        if details["total_balance"] > 0
    }

    # Display recommendation

    # Handle empty portfolio
    if total_estate == 0:
        flash("Votre portefeuille est vide. Commencez à construire votre patrimoine !", "info")
        return render_template(
            "dashboard.html",
            portfolio_summary={},
            total_estate=0,
            portfolio_analysis=[],
        )

    # Fetch user's risk profile
    user = db.session.query(Users).filter(Users.id == user_id).first()
    risk_profile = user.risk_profile

    # Define default repartition based on risk profiles
    risk_profiles = {
        "Prudent": {"Épargne": 0.5, "Immobilier": 0.3, "Actions": 0.2},
        "Dynamique": {"Épargne": 0.05, "Immobilier": 0.15, "Actions": 0.8},
        "Équilibré": {"Épargne": 0.25, "Immobilier": 0.25, "Actions": 0.5},
    }

    # Set default profile
    reco_percentages = risk_profiles.get(
        risk_profile, risk_profiles["Équilibré"]
    )

    # Calculate current and recommended totals dymanically
    current_totals = {
        category: details["total_balance"]
        for category, details in portfolio_summary.items()
    }
    reco_totals = {
        category: total_estate * reco_percentages.get(category, 0)
        for category in portfolio_summary.keys()
    }

    # Merge all portfolio data in a single list of dictionaries
    portfolio_analysis = [
        {
            "category": category,
            "current_balance": current_totals.get(category, 0),
            "current_percentage": (
                current_totals.get(category, 0) / total_estate
                if total_estate > 0
                else 0
            ),
            "recommended_balance": reco_totals.get(category, 0),
            "recommended_percentage": reco_percentages.get(category, 0),
            "gap": reco_totals.get(category, 0)
            - current_totals.get(category, 0),
        }
        for category in portfolio_summary.keys()
    ]

    # Render template
    return render_template(
        "dashboard.html",
        portfolio_summary=portfolio_summary,
        total_estate=total_estate,
        portfolio_analysis=portfolio_analysis,
    )


@app.route("/add-entry", methods=["GET", "POST"])
@login_required
def add_entry():
    if request.method == "POST":
        # Retrieve form data
        user_id = session["user_id"]
        category_name = request.form.get("category-name")
        sub_category = request.form.get("sub-category")
        amount = request.form.get("amount")
        timestamp = datetime.utcnow()

        # Validate input
        try:
            amount = float(amount)
            if amount == 0:
                flash("Le montant ne peut pas être nul", "error")
                return redirect("/add-entry")
        except ValueError:
            flash("Montant invalide")
            return redirect("/add-entry")

        if not category_name or not sub_category:
            flash("La catégorie et la sous-catégorie sont requises", "error")
            return redirect("/add-entry")

        # Query for the category
        category_query = Categories.query.filter_by(
            category_name=category_name, sub_category=sub_category
        ).first()
        if not category_query:
            flash(
                "Cette combinaison de catégorie et de sous-catégorie n'existe pas",
                "error",
            )
            return redirect("/add-entry")

        # Create and save the new entry
        category_id = category_query.id
        new_entry = Transactions(
            user_id=user_id,
            category_id=category_id,
            amount=amount,
            timestamp=timestamp,
        )
        try:
            db.session.add(new_entry)

            # Update balance in Portfolios table
            portfolio = Portfolios.query.filter_by(
                user_id=user_id, category_id=category_id
            ).first()
            if portfolio:
                portfolio.balance += amount
            else:
                portfolio = Portfolios(
                    user_id=user_id, category_id=category_id, balance=amount
                )
                db.session.add(portfolio)

            # Commit changes
            db.session.commit()
            flash("Investissement ajouté avec succès !", "success")
            return redirect("/dashboard")

        except Exception as e:
            db.session.rollback()
            flash("Une erreur s'est produite lors de l'ajout de l'entrée", e)
            return redirect("/dashboard")

    # Get unique categories and all categories
    distinct_categories = (
        Categories.query.with_entities(
            Categories.category_name
            ).distinct().all()
    )
    all_categories = [
        serialize_category(cat) for cat in Categories.query.all()
    ]

    return render_template(
        "add-entry.html",
        categories=distinct_categories,
        all_categories=all_categories,
    )


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
            flash("Montant invalide. Veuillez saisir une valeur numérique.", "error")
            return redirect("/withdraw")

        if not category_name or not sub_category_name or withdraw_amount <= 0:
            flash("Entrée invalide. Veuillez réessayer", "error")
            return redirect("/withdraw")

        # Retrieve category ID and current balance
        category_query = (
            db.session.query(Categories)
            .filter_by(category_name=category_name, sub_category=sub_category_name)
            .first()
        )
        if not category_query:
            flash(
                "Cette combinaison de catégorie et de sous-catégorie n'existe pas",
                "error",
            )
            return redirect("/withdraw")

        category_id = category_query.id

        # Fetch the current balance for the category
        portfolio_entry = (
            db.session.query(Portfolios)
            .filter_by(user_id=user_id, category_id=category_id)
            .first()
        )

        if not portfolio_entry or portfolio_entry.balance < withdraw_amount:
            flash("Solde insuffisant", "error")
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
            flash("Retrait effectué avec succès !", "success")
            return redirect("/dashboard")
        except Exception as e:
            db.session.rollback()
            flash(
                "Une erreur s'est produite lors du traitement de votre retrait",
                e,
            )
            return redirect("/withdraw")

    # Aggregate categories and sub-categories with their total balances
    withdraw_categories = (
        db.session.query(
            Categories.category_name,
            Categories.sub_category,
            Portfolios.balance
        )
        .join(Portfolios, Categories.id == Portfolios.category_id)
        .filter(Portfolios.user_id == user_id, Portfolios.balance > 0)
        .all()
    )

    # Transform data for the frontend
    distinct_categories = sorted(
        set([cat.category_name for cat in withdraw_categories])
    )
    withdraw_categories_data = [
        {
            "category": entry.category_name,
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
    user_id = session["user_id"]

    page = request.args.get("page", 1, type=int)
    per_page = 10

    # Query user's transactions
    transaction_entries = (
        db.session.query(
            Transactions,
            Categories.category_name.label("category_name"),
            Categories.sub_category.label("sub_category_name"),
        )
        .join(Categories, Transactions.category_id == Categories.id)
        .filter(Transactions.user_id == user_id)
        .order_by(Transactions.timestamp.desc())
    )

    # Apply pagination
    pagination = transaction_entries.paginate(
        page=page, per_page=per_page, error_out=False
    )

    if not transaction_entries:
        flash("Aucun historique de transactions trouvé", "info")
        return redirect("/dashboard")

    # Create a dictionary to hold table data
    transaction_history = [
        {
            "id": entry.Transactions.id,
            "category_name": entry.category_name,
            "sub_category_name": entry.sub_category_name,
            "amount": entry.Transactions.amount,
            "timestamp": entry.Transactions.timestamp.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        }
        for entry in pagination.items
    ]

    return render_template(
        "history.html",
        portfolio_history=transaction_history,
        pagination=pagination,
    )


@app.route("/delete-entry", methods=["POST"])
@login_required
def delete_entry():
    # Retrieve entry id from the form
    entry_id = request.form.get("entry_id")

    if not entry_id:
        flash("Identifiant d'entrée invalide", "error")
        return redirect("/history")

    # Retrieve portfolio transaction by id
    transaction = Transactions.query.filter_by(
        id=entry_id, user_id=session["user_id"]
    ).first()

    if not transaction:
        flash(
            "Transaction introuvable ou vous n'avez pas l'autorisation de la supprimer",
            "error",
        )
        return redirect("/history")

    # Calculate corresponding portfolio entry
    portfolio_entry = Portfolios.query.filter_by(
        user_id=session["user_id"], category_id=transaction.category_id
    ).first()

    if not portfolio_entry:
        flash("Entrée de portefeuille introuvable", "error")
        return redirect("/history")

    # Adjust portfolio balance based on transaction type (positive or negative)
    try:
        # Update portfolio balance
        portfolio_entry.balance -= transaction.amount

        # Delete the transaction entry
        db.session.delete(transaction)

        # Commit changes to both tables
        db.session.commit()

        flash("Transaction supprimée avec succès", "success")
    except Exception as e:
        db.session.rollback()
        flash(
            "Une erreur s'est produite lors de la suppression de la transaction",
            e,
        )

    # Redirect to history page
    return redirect("/history")


# Instantiate db
with app.app_context():
    db.create_all()

    # Insert default categories if Categories table is empty
    if Categories.query.count() == 0:
        default_categories = [
            Categories(category_name="Épargne", sub_category="Espèces"),
            Categories(category_name="Épargne", sub_category="Livret A/LDDS"),
            Categories(category_name="Épargne", sub_category="LEP"),
            Categories(category_name="Épargne", sub_category="Livret Jeune"),
            Categories(category_name="Épargne", sub_category="PEL/CEL"),
            Categories(category_name="Épargne", sub_category="Assurance-Vie"),
            Categories(category_name="Épargne", sub_category="PER"),
            Categories(category_name="Épargne", sub_category="PEE/PERCO"),
            Categories(category_name="Épargne", sub_category="PEA"),
            Categories(category_name="Immobilier", sub_category="Immobilier de Jouissance"),
            Categories(category_name="Immobilier", sub_category="Immobilier Locatif"),
            Categories(category_name="Immobilier", sub_category="SCPI"),
            Categories(category_name="Immobilier", sub_category="Crowdfunding Immobilier"),
            Categories(category_name="Actions", sub_category="Obligations"),
            Categories(category_name="Actions", sub_category="Actions"),
            Categories(category_name="Actions", sub_category="Cryptomonnaies"),
            Categories(category_name="Autres", sub_category="Private Equity"),
            Categories(category_name="Autres", sub_category="Métaux/Métaux Précieux"),
            Categories(category_name="Autres", sub_category="Placements Exotiques"),
        ]
        db.session.bulk_save_objects(default_categories)
        db.session.commit()


if __name__ == "__main__":
    app.run(debug=True)
