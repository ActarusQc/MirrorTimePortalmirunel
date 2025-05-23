import json
from app.models import User
from app import db # Import db instance for direct db interaction if needed
from werkzeug.security import generate_password_hash # To hash passwords for direct user creation

def test_register_success(client):
    """Test successful user registration."""
    response = client.post('/api/users/register', json={
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'User registered successfully'
    assert 'user' in data
    assert data['user']['username'] == 'newuser'
    assert data['user']['email'] == 'newuser@example.com'
    assert 'password' not in data['user'] # Ensure password is not returned

    # Verify user in database
    user = User.query.filter_by(username='newuser').first()
    assert user is not None
    assert user.email == 'newuser@example.com'

def test_register_existing_username(client, app):
    """Test registration with an existing username."""
    # Create a user directly in the db for testing
    with app.app_context():
        existing_user = User(username='existinguser', email='exists@example.com', password=generate_password_hash('password'))
        db.session.add(existing_user)
        db.session.commit()

    response = client.post('/api/users/register', json={
        'username': 'existinguser',
        'email': 'newemail@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'User with this username or email already exists'

def test_register_existing_email(client, app):
    """Test registration with an existing email."""
    with app.app_context():
        existing_user = User(username='anotheruser', email='existingemail@example.com', password=generate_password_hash('password'))
        db.session.add(existing_user)
        db.session.commit()

    response = client.post('/api/users/register', json={
        'username': 'newusername',
        'email': 'existingemail@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'User with this username or email already exists'

def test_register_missing_fields(client):
    """Test registration with missing fields."""
    # Missing password
    response = client.post('/api/users/register', json={
        'username': 'testuser',
        'email': 'test@example.com'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing username, email, or password'

    # Missing email
    response = client.post('/api/users/register', json={
        'username': 'testuser',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing username, email, or password'

    # Missing username
    response = client.post('/api/users/register', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing username, email, or password'

def test_login_success(client, app):
    """Test successful user login."""
    # Create a user to log in with
    with app.app_context():
        hashed_password = generate_password_hash('password123')
        user = User(username='loginuser', email='login@example.com', password=hashed_password)
        db.session.add(user)
        db.session.commit()

    response = client.post('/api/users/login', json={
        'username': 'loginuser',
        'password': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Login successful'
    assert 'user' in data
    assert data['user']['username'] == 'loginuser'
    assert 'password' not in data['user']

def test_login_incorrect_username(client):
    """Test login with an incorrect username."""
    response = client.post('/api/users/login', json={
        'username': 'nonexistentuser',
        'password': 'password123'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert data['message'] == 'Invalid username or password'

def test_login_incorrect_password(client, app):
    """Test login with an incorrect password."""
    with app.app_context():
        hashed_password = generate_password_hash('correctpassword')
        user = User(username='testpass', email='testpass@example.com', password=hashed_password)
        db.session.add(user)
        db.session.commit()

    response = client.post('/api/users/login', json={
        'username': 'testpass',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert data['message'] == 'Invalid username or password'

def test_login_missing_fields(client):
    """Test login with missing fields."""
    # Missing password
    response = client.post('/api/users/login', json={'username': 'testuser'})
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing username or password'

    # Missing username
    response = client.post('/api/users/login', json={'password': 'password123'})
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing username or password'
