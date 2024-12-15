from config import db
from datetime import datetime

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    hash = db.Column(db.String(120), nullable=False)
    risk_profile = db.Column(db.String(80), nullable=False)

    # Define a relationship to Portfolios for easier querying
    portfolios = db.relationship('Portfolios', backref='user', lazy=True)


class Categories(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    sub_category = db.Column(db.String(80), nullable=False)

    # Define a relationship to Portfolios for easier querying
    portfolios = db.relationship('Portfolios', backref='category', lazy=True)


class Portfolios(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), primary_key=True)
    balance = db.Column(db.Integer, nullable=False, default=0)

    # Define relationships for easier querying
    user = db.relationship('Users', backref='portfolios', lazy=True)
    category = db.relationship('Categories', backref='portfolios', lazy=True)


class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Define relationships for easier querying
    user = db.relationship('Users', backref='transactions', lazy=True)
    category = db.relationship('Categories', backref='transactions', lazy=True)

