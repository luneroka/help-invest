import pandas as pd
from config import db  # Import your db object from your Flask app
from models import Users, Categories, Portfolios, Transactions  # Import your models

def import_users():
    users_df = pd.read_csv('data/users.csv')
    for index, row in users_df.iterrows():
        user = Users(
            id=row['id'],
            username=row['username'],
            hash=row['hash'],
            risk_profile=row['risk_profile']
        )
        db.session.add(user)
    db.session.commit()

def import_categories():
    categories_df = pd.read_csv('data/categories.csv')
    for index, row in categories_df.iterrows():
        category = Categories(
            id=row['id'],
            name=row['name']
        )
        db.session.add(category)
    db.session.commit()

def import_portfolios():
    portfolios_df = pd.read_csv('data/portfolios.csv')
    for index, row in portfolios_df.iterrows():
        portfolio = Portfolios(
            id=row['id'],
            user_id=row['user_id'],
            name=row['name']
        )
        db.session.add(portfolio)
    db.session.commit()

def import_transactions():
    transactions_df = pd.read_csv('data/transactions.csv')
    for index, row in transactions_df.iterrows():
        transaction = Transactions(
            id=row['id'],
            user_id=row['user_id'],
            category_id=row['category_id'],
            amount=row['amount'],
            timestamp=row['timestamp']
        )
        db.session.add(transaction)
    db.session.commit()

def import_data():
    import_users()
    import_categories()
    import_portfolios()
    import_transactions()

if __name__ == '__main__':
    import_data()