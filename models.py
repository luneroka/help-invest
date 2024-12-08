from config import db
from datetime import datetime

class Users(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(80), unique=True, nullable=False)
  hash = db.Column(db.String(120), nullable=False)
  risk_profile = db.Column(db.String(80), nullable=False)

  
class Categories(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(80), nullable=False)
  sub_category = db.Column(db.String(80), nullable=False)


class Portfolios(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
  category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
  amount = db.Column(db.Integer, nullable=False)
  entry_time = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)

  # Define relationships for easier querying
  user = db.relationship('Users', backref='portfolios')
  category = db.relationship('Categories', backref='portfolios')