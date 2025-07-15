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


@app.route("/api/logout", methods=["POST"])
def logout():
    try:
        session.clear()

        return jsonify({
            "success": True,
            "message": "Déconnexion réussie"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Erreur lors de la déconnexion"
        }), 500


@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        # Check if request contains JSON
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Retrieve form data
        username = data.get("username")
        password = data.get("password")
        confirmation = data.get("confirmation")

        # Validate username input
        if not username:
            return jsonify({
                "success": False,
                "message": "Nom d'utilisateur requis"
            }), 400

        # Validate password input
        if not password:
            return jsonify({
                "success": False,
                "message": "Mot de passe requis"
            }), 400

        # Validate password strength
        password_error = validate_password_strength(password)
        if password_error:
            return jsonify({
                "success": False,
                "message": password_error
            }), 400

        # Validate other input
        if not confirmation:
            return jsonify({
                "success": False,
                "message": "Veuillez confirmer le mot de passe"
            }), 400

        if confirmation != password:
            return jsonify({
                "success": False,
                "message": "Les mots de passe ne correspondent pas"
            }), 400

        # Check if username already exists
        existing_user = Users.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({
                "success": False,
                "message": "Ce nom d'utilisateur existe déjà"
            }), 400

        # Hash password and create new user
        hashed_password = generate_password_hash(
            password, method="pbkdf2:sha256", salt_length=16
        )
        new_user = Users(
            username=username, hash=hashed_password, risk_profile="équilibré"
        )

        # Try adding new user to db
        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({
                "success": True,
                "message": "Votre compte a été créé avec succès"
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Une erreur s'est produite. Veuillez réessayer: {str(e)}"
            }), 500

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


@app.route("/api/change-password", methods=["POST"])
@login_required
def change_password():
    try:
        # Check if request contains JSON
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Retrieve form data
        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")
        confirmation = data.get("confirmation")

        # Validate input
        if not current_password:
            return jsonify({
                "success": False,
                "message": "Mot de passe actuel requis"
            }), 400

        if not new_password:
            return jsonify({
                "success": False,
                "message": "Nouveau mot de passe requis"
            }), 400

        if not confirmation:
            return jsonify({
                "success": False,
                "message": "Veuillez confirmer le nouveau mot de passe"
            }), 400

        if confirmation != new_password:
            return jsonify({
                "success": False,
                "message": "Les mots de passe ne correspondent pas"
            }), 400

        # Validate password strength
        password_error = validate_password_strength(new_password)
        if password_error:
            return jsonify({
                "success": False,
                "message": password_error
            }), 400

        # Retrieve user
        user = Users.query.filter_by(id=session["user_id"]).first()

        # Validate current password
        if not user or not check_password_hash(user.hash, current_password):
            return jsonify({
                "success": False,
                "message": "Mot de passe actuel incorrect"
            }), 401

        # Check if new password is different from current password
        if check_password_hash(user.hash, new_password):
            return jsonify({
                "success": False,
                "message": "Le nouveau mot de passe doit être différent de l'ancien"
            }), 400

        # Hash new password
        new_hashed_password = generate_password_hash(
            new_password, method="pbkdf2:sha256", salt_length=16
        )

        # Try updating users table with new password
        try:
            user.hash = new_hashed_password
            db.session.commit()
            session.clear()
            return jsonify({
                "success": True,
                "message": "Votre mot de passe a été mis à jour avec succès ! Veuillez vous reconnecter"
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Une erreur s'est produite. Veuillez réessayer: {str(e)}"
            }), 500

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


@app.route("/")
def index():
    return jsonify({
        "name": "HelpInvest API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": ["/api/login", "/api/logout", "/api/signup"],
            "user": ["/api/change-password"],
            "debug": ["/debug/users"]
        }
    })


@app.route("/api/risk-profile", methods=["GET"])
@login_required
def get_risk_profile():
    try:
        user_id = session["user_id"]
        user = Users.query.filter_by(id=user_id).first()
        
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé"
            }), 404
        
        return jsonify({
            "success": True,
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


@app.route("/api/risk-profile", methods=["POST"])
@login_required
def update_risk_profile():
    try:
        # Check if request contains JSON
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        # Retrieve form data
        risk_profile = data.get("riskProfile")

        # Validate input
        if not risk_profile:
            return jsonify({
                "success": False,
                "message": "Profil de risque requis"
            }), 400

        # Validate risk profile value
        valid_profiles = ["prudent", "équilibré", "dynamique"]
        if risk_profile.lower() not in valid_profiles:
            return jsonify({
                "success": False,
                "message": "Profil de risque invalide"
            }), 400

        # Get user
        user_id = session["user_id"]
        user = Users.query.filter_by(id=user_id).first()
        
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé"
            }), 404

        # Update risk profile
        try:
            user.risk_profile = risk_profile.lower()
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Profil de risque mis à jour avec succès",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "risk_profile": user.risk_profile
                }
            }), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Erreur lors de la mise à jour: {str(e)}"
            }), 500

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


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
