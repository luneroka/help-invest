
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from .helpers import eur, percentage
# from flask_migrate import Migrate

# Initialize Flask app
app = Flask(__name__)

# Custom filters
app.jinja_env.filters["eur"] = eur
app.jinja_env.filters["percentage"] = percentage

# Wrap app in CORS to disable error and enable cross origin requests
CORS(app)

# Initialize Flask-WTF's CSRF protection
csrf = CSRFProtect(app)

# Get the DATABASE_URL environment variable
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Configure the SQLAlchemy database URI
app.config['SQLALCHEMY_DATABASE_URI'] = database_url

# Set-up secret key, necessary for flash messages and CSRF protection
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

# Only for development phase. Enable when deploying
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True


# Create instance of the database
db = SQLAlchemy(app)
