from config import db, app
from models import Categories

# Define categories and subcategories
categories = [
    {"name": "Savings", "sub_category": "Cash"},
    {"name": "Savings", "sub_category": "HYSA"},
    {"name": "Savings", "sub_category": "CD"},
    {"name": "Savings", "sub_category": "HSA"},
    {"name": "Real Estate", "sub_category": "Residential"},
    {"name": "Real Estate", "sub_category": "Commercial"},
    {"name": "Real Estate", "sub_category": "REITs"},
    {"name": "Real Estate", "sub_category": "Crowdfunding"},
    {"name": "Stocks", "sub_category": "Stocks"},
    {"name": "Stocks", "sub_category": "Bonds"},
    {"name": "Stocks", "sub_category": "ETFs"},
    {"name": "Stocks", "sub_category": "Crypto"},
    {"name": "Stocks", "sub_category": "401k"},
    {"name": "Stocks", "sub_category": "IRA"},
]

# Run within application context
with app.app_context():
    for category in categories:
        new_category = Categories(name=category["name"], sub_category=category["sub_category"])
        db.session.add(new_category)

    # Commit changes
    try:
        db.session.commit()
        print("Categories populated successfully!")
    except Exception as e:
        db.session.rollback()
        print(f"Error occurred: {e}")