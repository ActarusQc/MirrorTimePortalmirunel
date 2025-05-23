from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.user import User

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/users')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing username, email, or password'}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'User with this username or email already exists'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        # Exclude password hash from the response
        user_data = {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email
        }
        return jsonify({'message': 'User registered successfully', 'user': user_data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to register user', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400

    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    # Exclude password hash from the response
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email
    }
    # In a real application, you would generate a session token (e.g., JWT) here.
    return jsonify({'message': 'Login successful', 'user': user_data}), 200
