import re
from flask import request, jsonify
from functools import wraps
from firebase_admin import auth


def firebase_token_required(f):
    """Decorator to require Firebase ID token for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is missing. Please login again.'
            }), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token['uid']
            user_email = decoded_token.get('email')
            
            # Pass user info to the function
            return f(user_id, user_email, *args, **kwargs)
            
        except auth.InvalidIdTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid token. Please login again.'
            }), 401
        except auth.ExpiredIdTokenError:
            return jsonify({
                'success': False,
                'message': 'Token expired. Please login again.'
            }), 401
        except Exception as e:
            print(f"Token verification error: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Token verification failed. Please login again.'
            }), 401
    
    return decorated_function


def get_user_from_token(token):
    """Helper function to get user info from Firebase token"""
    try:
        if token.startswith('Bearer '):
            token = token[7:]
        
        decoded_token = auth.verify_id_token(token)
        return {
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name'),
            'picture': decoded_token.get('picture')
        }
    except Exception as e:
        print(f"Token parsing error: {str(e)}")
        return None


def serialize_category(category):
    """Helper to serialize category objects for API responses"""
    return {
        "id": category.id,
        "name": category.category_name,
        "sub_category": category.sub_category
    }


def eur(value):
    """Format value as EUR"""
    return f"{value:,.0f} €".replace(",", " ").replace(".", ",")


def percentage(value):
    """Format value as percentage"""
    return f"{value * 100:,.0f}%"

def get_category_data(user_id, category_name):
    """Helper function to get portfolio data for a specific category"""
    from .config import db
    from .models import Categories, Portfolios
    
    category_data = (
        db.session.query(
            Portfolios.balance,
            Categories.sub_category
        )
        .join(Categories, Portfolios.category_id == Categories.id)
        .filter(
            Portfolios.user_id == user_id,
            Categories.category_name == category_name,
            Portfolios.balance > 0
        )
        .all()
    )

    total_amount = 0
    category_summary = {}

    for balance, sub_category_name in category_data:
        total_amount += balance

        if sub_category_name not in category_summary:
            category_summary[sub_category_name] = 0
        category_summary[sub_category_name] += balance

    return category_summary, total_amount

    
# Legacy functions - kept for backward compatibility but no longer used
def validate_password_strength(password):
    """DEPRECATED: Password validation now handled by Firebase"""
    if len(password) < 8:
        return "Le mot de passe doit contenir au moins 8 caractères."
    if not re.search(r"[A-Z]", password):
        return "Le mot de passe doit contenir au moins une lettre majuscule."
    if not re.search(r"[@$!%*?&]", password):
        return "Le mot de passe doit contenir au moins un caractère spécial (@, $, !, %, *, ?, &)."
    return None