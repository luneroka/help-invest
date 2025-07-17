from .config import db
from datetime import datetime


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=True)  # Keep for backward compatibility
    risk_profile = db.Column(db.String(80), nullable=False, default="équilibré")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    portfolios = db.relationship('Portfolios', backref='user', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transactions', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    @staticmethod
    def get_or_create_user(firebase_uid, email, name=None):
        """Get existing user or create new one from Firebase data"""
        user = Users.query.filter_by(firebase_uid=firebase_uid).first()
        if not user:
            user = Users(
                firebase_uid=firebase_uid,
                email=email,
                username=name or email.split('@')[0],  # Use name or email prefix as username
                risk_profile="équilibré"
            )
            db.session.add(user)
            db.session.commit()
        return user


class Categories(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(80), nullable=False)
    sub_category = db.Column(db.String(80), nullable=False)


class Portfolios(db.Model):
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), primary_key=True
        )
    category_id = db.Column(
        db.Integer, db.ForeignKey("categories.id"), primary_key=True
    )
    balance = db.Column(db.Integer, nullable=False, default=0)


class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(
        db.Integer, db.ForeignKey("categories.id"), nullable=False
        )
    amount = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)
