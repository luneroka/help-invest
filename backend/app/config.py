
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
from .helpers import eur, percentage
# from flask_migrate import Migrate

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Initialize Flask app
app = Flask(__name__)

# Custom filters
app.jinja_env.filters["eur"] = eur
app.jinja_env.filters["percentage"] = percentage

# Wrap app in CORS to disable error and enable cross origin requests
CORS(app, origin='*')

# Initialize Flask-WTF's CSRF protection
csrf = CSRFProtect(app)

# Get the DATABASE_URL environment variable
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# If DATABASE_URL is not set, construct it from individual components
if not database_url:
    db_user = os.environ.get('POSTGRES_USER')
    db_password = os.environ.get('POSTGRES_PASSWORD')
    db_host = os.environ.get('POSTGRES_HOST', 'postgres')
    db_port = os.environ.get('POSTGRES_PORT', '5432')
    db_name = os.environ.get('POSTGRES_DB')
    
    if db_user and db_password and db_name:
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

# Configure the SQLAlchemy database URI
app.config['SQLALCHEMY_DATABASE_URI'] = database_url

# Set-up secret key, necessary for flash messages and CSRF protection
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

# Only for development phase. Enable when deploying
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True


# Create instance of the database
db = SQLAlchemy(app)
