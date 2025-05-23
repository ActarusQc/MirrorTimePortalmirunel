from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_mapping(
            SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///:memory:'), # Default to in-memory for safety
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            # Add other default configurations here
        )
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
    
    # Ensure the instance folder exists (if using instance-relative config)
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)

    # Register blueprints here
    from app.routes import all_blueprints
    for bp in all_blueprints:
        app.register_blueprint(bp)

    return app
