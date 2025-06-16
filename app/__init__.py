from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .data_models import db # Import db instance from data_models.py

# It's good practice to configure the database URI from environment variables
# For now, we'll use a default local PostgreSQL URI.
# Replace with your actual database URI.
# Example: postgresql://user:password@host:port/database
DATABASE_URI = 'postgresql://user:password@localhost/ai_test_case_platform'

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Silence the deprecation warning

    db.init_app(app)
    Migrate(app, db) # Initialize Flask-Migrate

    # Register Blueprints or import routes here if you have them
    # For example:
    # from .main import main as main_blueprint
    # app.register_blueprint(main_blueprint)

    return app
