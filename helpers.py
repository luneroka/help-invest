import re
from flask import redirect, render_template, session
from functools import wraps

# Password strength validator
def validate_password_strength(password):
    # Password should be at least 8 characters long, contain at least one uppercase letter and one special character
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r"[@$!%*?&]", password):
        return "Password must contain at least one special character (@, $, !, %, *, ?, &)."
    return None

def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function


def serialize_category(category):
    return {
        "id": category.id,
        "name": category.name,
        "sub_category": category.sub_category
    }

def usd(value):
    """Format value as USD."""
    return f"${value:,.0f}"