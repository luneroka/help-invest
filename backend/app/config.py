import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from .helpers import eur, percentage
import firebase_admin
from firebase_admin import credentials

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Initialize Flask app
app = Flask(__name__)

# Custom filters
app.jinja_env.filters["eur"] = eur
app.jinja_env.filters["percentage"] = percentage

# Wrap app in CORS to disable error and enable cross origin requests
CORS(app, 
    origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Initialize Firebase Admin SDK
firebase_credentials_path = os.environ.get('FIREBASE_CREDENTIALS_PATH')
if firebase_credentials_path and os.path.exists(firebase_credentials_path):
    cred = credentials.Certificate(firebase_credentials_path)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully")
else:
    print("Firebase credentials not found - authentication will not work")

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

# Set-up secret key, necessary for session management (if needed for other purposes)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

# Only for development phase. Enable when deploying
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True


# Create instance of the database
db = SQLAlchemy(app)
