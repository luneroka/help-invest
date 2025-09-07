from .config import db
from datetime import datetime
from .encryption_utils import monetary_crypto


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
    balance_encrypted = db.Column(db.Text, nullable=False, default="")
    
    # Property to handle encryption/decryption transparently
    @property
    def balance(self):
        if not self.balance_encrypted:
            return 0.0
        return monetary_crypto.decrypt_amount(self.balance_encrypted)
    
    @balance.setter
    def balance(self, value: float):
        self.balance_encrypted = monetary_crypto.encrypt_amount(value)


class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(
        db.Integer, db.ForeignKey("categories.id"), nullable=False
        )
    amount_encrypted = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)

    # Property to handle encryption/decryption transparently
    @property
    def amount(self):
        return monetary_crypto.decrypt_amount(self.amount_encrypted)
    
    @amount.setter
    def amount(self, value: float):
        self.amount_encrypted = monetary_crypto.encrypt_amount(value)