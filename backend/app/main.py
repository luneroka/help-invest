from flask import request, jsonify
from .config import app, db
from .models import Users, Categories, Portfolios, Transactions
from .helpers import (
    firebase_token_required,
    serialize_category,
    get_category_data
)
from datetime import datetime

# Remove CSRF error handler registration since we're using Firebase JWT
# register_error_handlers(app)


@app.route("/api/sync-user", methods=["POST"])
@firebase_token_required
def sync_user(firebase_uid, user_email):
    """Create or update user record in database after Firebase authentication"""
    try:
        # Extract additional user info from request if provided
        data = request.get_json() or {}
        display_name = data.get("displayName")
        
        # Get or create user in database
        user = Users.get_or_create_user(
            firebase_uid=firebase_uid,
            email=user_email,
            name=display_name
        )

        return jsonify({
            "success": True,
            "message": "Utilisateur synchronisé avec succès",
            "user": {
                "id": user.id,
                "email": user.email,
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


@app.route("/")
def index():
    return jsonify({
        "name": "HelpInvest API",
        "version": "1.0.0",
        "status": "running",
        "authentication": "Firebase JWT",
        "description": "Authentication is handled by Firebase on the frontend. All protected routes require Authorization header with Firebase ID token.",
        "endpoints": {
            "user": ["/api/sync-user", "/api/risk-profile"],
            "portfolio": ["/api/dashboard", "/api/epargne", "/api/immo", "/api/invest", "/api/withdraw", "/api/history"],
            "account": ["/api/delete-entry", "/api/delete-account"]
        }
    })


@app.route("/api/risk-profile", methods=["GET"])
@firebase_token_required
def get_risk_profile(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404
        
        return jsonify({
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
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
@firebase_token_required
def update_risk_profile(firebase_uid, user_email):
    try:
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()
        risk_profile = data.get("riskProfile")

        if not risk_profile:
            return jsonify({
                "success": False,
                "message": "Profil de risque requis"
            }), 400

        valid_profiles = ["prudent", "équilibré", "dynamique"]
        if risk_profile.lower() not in valid_profiles:
            return jsonify({
                "success": False,
                "message": "Profil de risque invalide"
            }), 400

        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        try:
            user.risk_profile = risk_profile.lower()
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Profil de risque mis à jour avec succès",
                "user": {
                    "id": user.id,
                    "email": user.email,
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


@app.route("/api/dashboard", methods=["GET"])
@firebase_token_required
def dashboard(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        # Query user balances
        portfolio_data = (
            db.session.query(
                Portfolios.balance,
                Categories.category_name,
                Categories.sub_category
            )
            .join(Categories, Portfolios.category_id == Categories.id)
            .filter(Portfolios.user_id == user.id)
            .all()
        )

        # Initialize total estate and portfolio summary
        total_estate = 0
        portfolio_summary = {}

        for balance, category_name, sub_category_name in portfolio_data:
            if balance == 0:
                continue

            total_estate += balance

            if category_name not in portfolio_summary:
                portfolio_summary[category_name] = {
                    "total_balance": 0,
                    "sub_categories": {},
                }

            portfolio_summary[category_name]["total_balance"] += balance

            if sub_category_name not in portfolio_summary[category_name]["sub_categories"]:
                portfolio_summary[category_name]["sub_categories"][sub_category_name] = 0
            portfolio_summary[category_name]["sub_categories"][sub_category_name] += balance

        portfolio_summary = {
            category: details
            for category, details in portfolio_summary.items()
            if details["total_balance"] > 0
        }

        return jsonify({
            "success": True,
            "message": "Données du portefeuille récupérées avec succès",
            "portfolio_summary": portfolio_summary,
            "total_estate": total_estate,
            "user": {
                "id": user.id,
                "email": user.email,
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


@app.route("/api/invest", methods=["GET", "POST"])
@firebase_token_required
def invest(firebase_uid, user_email):
    user = Users.query.filter_by(firebase_uid=firebase_uid).first()
    if not user:
        return jsonify({
            "success": False,
            "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
        }), 404

    if request.method == "POST":
        try:
            if not request.is_json:
                return jsonify({
                    "success": False,
                    "message": "Content-Type must be application/json"
                }), 400

            data = request.get_json()
            category_name = data.get("categoryName")
            sub_category = data.get("subCategory")
            amount = data.get("amount")
            timestamp = datetime.utcnow()

            try:
                amount = float(amount)
                if amount <= 0:
                    return jsonify({
                        "success": False,
                        "message": "Le montant doit être supérieur à zéro"
                    }), 400
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "message": "Montant invalide"
                }), 400

            if not category_name or not sub_category:
                return jsonify({
                    "success": False,
                    "message": "La catégorie et la sous-catégorie sont requises"
                }), 400

            category_query = Categories.query.filter_by(
                category_name=category_name, sub_category=sub_category
            ).first()
            if not category_query:
                return jsonify({
                    "success": False,
                    "message": "Cette combinaison de catégorie et de sous-catégorie n'existe pas"
                }), 400

            category_id = category_query.id
            new_entry = Transactions(
                user_id=user.id,
                category_id=category_id,
                amount=amount,
                timestamp=timestamp,
            )
            
            try:
                db.session.add(new_entry)

                portfolio = Portfolios.query.filter_by(
                    user_id=user.id, category_id=category_id
                ).first()
                if portfolio:
                    portfolio.balance += amount
                else:
                    portfolio = Portfolios(
                        user_id=user.id, category_id=category_id, balance=amount
                    )
                    db.session.add(portfolio)

                db.session.commit()
                return jsonify({
                    "success": True,
                    "message": "Investissement ajouté avec succès"
                }), 201

            except Exception as e:
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "message": f"Une erreur s'est produite lors de l'ajout de l'entrée: {str(e)}"
                }), 500
                
        except Exception as e:
            print(f"Exception occurred: {str(e)}")
            return jsonify({
                "success": False,
                "message": f"Erreur serveur: {str(e)}"
            }), 500

    # GET request
    try:
        distinct_categories = (
            Categories.query.with_entities(Categories.category_name).distinct().all()
        )
        all_categories = [serialize_category(cat) for cat in Categories.query.all()]

        return jsonify({
            "success": True,
            "message": "Catégories récupérées avec succès",
            "distinct_categories": [cat.category_name for cat in distinct_categories],
            "all_categories": all_categories
        }), 200

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


@app.route("/api/withdraw", methods=["GET", "POST"])
@firebase_token_required
def withdraw(firebase_uid, user_email):
    user = Users.query.filter_by(firebase_uid=firebase_uid).first()
    if not user:
        return jsonify({
            "success": False,
            "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
        }), 404
    
    if request.method == "POST":
        try:
            if not request.is_json:
                return jsonify({
                    "success": False,
                    "message": "Content-Type must be application/json"
                }), 400

            data = request.get_json()
            category_name = data.get("categoryName")
            sub_category_name = data.get("subCategory")
            
            try:
                withdraw_amount = float(data.get("amount"))
            except (ValueError, TypeError):
                return jsonify({
                    "success": False,
                    "message": "Montant invalide"
                }), 400

            if not category_name or not sub_category_name or withdraw_amount <= 0:
                return jsonify({
                    "success": False,
                    "message": "Entrée invalide. Veuillez réessayer"
                }), 400

            category_query = (
                db.session.query(Categories)
                .filter_by(category_name=category_name, sub_category=sub_category_name)
                .first()
            )
            if not category_query:
                return jsonify({
                    "success": False,
                    "message": "Cette combinaison de catégorie et de sous-catégorie n'existe pas"
                }), 400

            category_id = category_query.id

            portfolio_entry = (
                db.session.query(Portfolios)
                .filter_by(user_id=user.id, category_id=category_id)
                .first()
            )

            if not portfolio_entry or portfolio_entry.balance < withdraw_amount:
                return jsonify({
                    "success": False,
                    "message": "Solde insuffisant pour effectuer ce retrait"
                }), 400

            portfolio_entry.balance -= withdraw_amount

            withdrawal_transaction = Transactions(
                user_id=user.id,
                category_id=category_id,
                amount=-withdraw_amount,
                timestamp=datetime.utcnow(),
            )

            try:
                db.session.add(withdrawal_transaction)
                db.session.commit()
                return jsonify({
                    "success": True,
                    "message": "Retrait effectué avec succès"
                }), 201

            except Exception as e:
                db.session.rollback()
                return jsonify({
                    "success": False,
                    "message": f"Une erreur s'est produite lors de l'enregistrement du retrait: {str(e)}"
                }), 500

        except Exception as e:
            print(f"Exception occurred: {str(e)}")
            return jsonify({
                "success": False,
                "message": f"Erreur serveur: {str(e)}"
            }), 500
    
    # GET request
    try:
        withdraw_categories = (
            db.session.query(
                Categories.category_name,
                Categories.sub_category,
                Portfolios.balance
            )
            .join(Portfolios, Categories.id == Portfolios.category_id)
            .filter(Portfolios.user_id == user.id, Portfolios.balance > 0)
            .all()
        )

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

        return jsonify({
            "success": True,
            "message": "Catégories de retrait récupérées avec succès",
            "distinct_categories": distinct_categories,
            "withdraw_categories": withdraw_categories_data
        }), 200

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


@app.route("/api/history", methods=['GET'])
@firebase_token_required
def view_history(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)

        pagination = (
            db.session.query(
                Transactions,
                Categories.category_name.label("category_name"),
                Categories.sub_category.label("sub_category_name"),
            )
            .join(Categories, Transactions.category_id == Categories.id)
            .filter(Transactions.user_id == user.id)
            .order_by(Transactions.timestamp.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        if not pagination.items:
            return jsonify({
                "success": True,
                "message": "Aucune transaction trouvée",
                "transaction_history": [],
                "pagination": {
                    "page": 1,
                    "per_page": per_page,
                    "total": 0,
                    "pages": 0,
                    "has_next": False,
                    "has_prev": False
                }
            }), 200

        transaction_history = [
            {
                "id": entry.Transactions.id,
                "category_name": entry.category_name,
                "sub_category_name": entry.sub_category_name,
                "amount": entry.Transactions.amount,
                "timestamp": entry.Transactions.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for entry in pagination.items
        ]

        return jsonify({
            "success": True,
            "message": "Historique des transactions récupéré avec succès",
            "transaction_history": transaction_history,
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev
            }
        }), 200

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


@app.route("/api/delete-entry", methods=["DELETE", "POST"])
@firebase_token_required
def delete_entry(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Content-Type must be application/json"
            }), 400

        data = request.get_json()
        entry_id = data.get("entry_id")

        if not entry_id:
            return jsonify({
                "success": False,
                "message": "Identifiant d'entrée requis"
            }), 400

        transaction = Transactions.query.filter_by(
            id=entry_id, user_id=user.id
        ).first()

        if not transaction:
            return jsonify({
                "success": False,
                "message": "Transaction introuvable ou vous n'avez pas l'autorisation de la supprimer"
            }), 404

        portfolio_entry = Portfolios.query.filter_by(
            user_id=user.id, category_id=transaction.category_id
        ).first()

        if not portfolio_entry:
            return jsonify({
                "success": False,
                "message": "Entrée de portefeuille introuvable"
            }), 404

        try:
            portfolio_entry.balance -= transaction.amount
            db.session.delete(transaction)
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "Transaction supprimée avec succès"
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Une erreur s'est produite lors de la suppression: {str(e)}"
            }), 500

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500



@app.route("/api/epargne", methods=["GET"])
@firebase_token_required
def epargne(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        epargne_summary, total_epargne = get_category_data(user.id, "Épargne")

        return jsonify({
            "success": True,
            "message": "Données d'épargne récupérées avec succès",
            "epargne_summary": epargne_summary,
            "total_epargne": total_epargne,
            "user": {
                "id": user.id,
                "email": user.email,
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

@app.route("/api/immo", methods=["GET"])
@firebase_token_required
def immo(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        immo_summary, total_immo = get_category_data(user.id, "Immobilier")

        return jsonify({
            "success": True,
            "message": "Données immobilières récupérées avec succès",
            "immo_summary": immo_summary,
            "total_immo": total_immo,
            "user": {
                "id": user.id,
                "email": user.email,
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

@app.route("/api/autres", methods=["GET"])
@firebase_token_required
def autres(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404

        autres_summary, total_autres = get_category_data(user.id, "Autres")

        return jsonify({
            "success": True,
            "message": "Données autres récupérées avec succès",
            "autres_summary": autres_summary,
            "total_autres": total_autres,
            "user": {
                "id": user.id,
                "email": user.email,
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


@app.route("/api/delete-account", methods=["POST"])
@firebase_token_required
def delete_account(firebase_uid, user_email):
    try:
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur non trouvé. Veuillez vous reconnecter."
            }), 404
        
        try:
            # Delete user with cascade to portfolios and transactions
            db.session.delete(user)
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "Votre compte a été supprimé avec succès. Veuillez également supprimer votre compte Firebase."
            }), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Erreur lors de la suppression : {str(e)}"
            }), 500
    
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur serveur: {str(e)}"
        }), 500


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
