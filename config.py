import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from helpers import usd, percentage
from dotenv import load_dotenv
load_dotenv()
# from flask_migrate import Migrate

# Initialize Flask app
app = Flask(__name__)

# Custom filters
app.jinja_env.filters["usd"] = usd
app.jinja_env.filters["percentage"] = percentage

# Enable CORS
CORS(app)

# Enable CSRF protection
csrf = CSRFProtect(app)

# Get environment variables
database_url = os.environ.get('DATABASE_URL')
secret_key = os.environ.get('SECRET_KEY')

# Raise errors if critical environment variables are missing
if not database_url:
    raise RuntimeError("DATABASE_URL environment variable not set.")
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable not set.")

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SECRET_KEY'] = secret_key
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Recommended setting

# Initialize database
db = SQLAlchemy(app)

# migrate = Migrate(app, db)