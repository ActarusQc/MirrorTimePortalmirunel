import pytest
import os
from app import create_app, db
from app.models import User, HistoryItem # Ensure all models are imported for db.create_all()

@pytest.fixture(scope='function') # Changed to function scope for cleaner tests
def app():
    """Create and configure a new app instance for each test."""
    
    # Create a temporary SQLite database file for each test session
    # Or use in-memory: 'sqlite:///:memory:'
    # Using a file-based SQLite for easier inspection if needed, but in-memory is faster.
    # Let's stick to in-memory for speed and isolation.
    db_uri = 'sqlite:///:memory:'
    
    flask_app = create_app(test_config={
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': db_uri,
        'SQLALCHEMY_TRACK_MODIFICATIONS': False, # Good practice for tests
        'WTF_CSRF_ENABLED': False, # Disable CSRF forms for testing if you use Flask-WTF
        'DEBUG': False # Ensure debug is False for testing unless specifically needed
    })

    with flask_app.app_context():
        db.create_all() # Create all tables

    yield flask_app

    # Teardown: close and remove the database if it was file-based
    # For in-memory SQLite, this is handled automatically when the context ends.
    with flask_app.app_context():
        db.session.remove() # Ensure session is closed
        db.drop_all()       # Drop all tables to ensure clean state for next test if scope was 'module'

@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope='function')
def runner(app):
    """A test runner for click commands."""
    return app.test_cli_runner()

# Optional: Fixture to create a test user directly in the DB
@pytest.fixture(scope='function')
def init_database(app):
    """Initialize database with some data if needed or just ensure it's clean."""
    # This fixture can be used to populate the database with initial data for tests
    # For now, it just ensures a clean state due to function-scoped app fixture.
    # If you needed specific data for a module of tests, you might create it here.
    # Example:
    # with app.app_context():
    #     user1 = User(username='testuser1', email='test1@example.com', password='password')
    #     db.session.add(user1)
    #     db.session.commit()
    # yield db # or yield nothing
    # with app.app_context():
    #     db.drop_all() # Clean up if you added data at module scope
    #     db.create_all()
    pass # Using function-scoped app/client, so db is clean per test.

# Example of how to use init_database:
# def test_example(client, init_database):
#     # init_database has run, possibly populating the DB
#     response = client.get('/some_route_expecting_data')
#     assert response.status_code == 200
#
# This fixture is more useful if your app fixture is module-scoped.
# With function-scoped app fixture, db.create_all() and db.drop_all()
# already provide a clean slate.
# However, it can be a convenient place to create common test data.

@pytest.fixture(scope='function')
def new_user(app):
    """A fixture to create a new user and add it to the database for tests."""
    with app.app_context():
        user = User(username='testuser', email='test@example.com', password='testpassword')
        # Note: password should be hashed if your login logic expects hashed passwords
        # For direct model creation for testing relationships, raw password is fine if not testing auth itself.
        # If testing login, you'd register via API or hash password here.
        db.session.add(user)
        db.session.commit()
        return user
