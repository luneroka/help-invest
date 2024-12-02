from config import db

class Users(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(80), unique=True, nullable=False)
  hash = db.Column(db.String(120), nullable=False)
  risk_profile = db.Column(db.String(80), nullable=False)

  def to_json(self):
    return {
      "id": self.id,
      "username": self.username,
      "hash": self.hash,
      "riskProfile": self.risk_profile,
    }
  
class Categories(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(80), nullable=False)
  sub_category = db.Column(db.String(80), nullable=False)

  def to_json(self):
    return {
      "id": self.id,
      "name": self.name,
      "subCategory": self.sub_category,
    }

class Portfolios(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
  category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
  amount = db.Column(db.Integer, nullable=False)

  # Define relationships for easier querying
  user = db.relationship('Users', backref='portfolios')
  category = db.relationship('Categories', backref='portfolios')

  def to_json(self):
    return {
      "id": self.id,
      "userId": self.user_id,
      "categoryId": self.category_id,
      "amount": self.amount,
    }