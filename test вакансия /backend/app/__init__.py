import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configure the app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///materials.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS
    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    
    # Import and register GraphQL blueprint
    from app.routes.graphql import graphql_blueprint
    app.register_blueprint(graphql_blueprint)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app 