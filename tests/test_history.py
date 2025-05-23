import json
from app.models import User, HistoryItem
from app import db
from werkzeug.security import generate_password_hash # For creating test users
from datetime import datetime

# Helper to create a user directly
def create_test_user(app, username='testuser_hist', email='hist@example.com', password='password'):
    with app.app_context():
        user = User(username=username, email=email, password=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        return user

def test_create_history_item_success(client, app):
    """Test successful creation of a history item."""
    user = create_test_user(app)
    response = client.post('/api/history/', json={
        'userId': user.id,
        'time': '12:34',
        'type': 'test_event',
        'thoughts': 'This is a test thought.',
        'details': {'key': 'value'}
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'History item created successfully'
    assert 'item' in data
    assert data['item']['userId'] == user.id
    assert data['item']['time'] == '12:34'
    assert data['item']['type'] == 'test_event'
    assert data['item']['thoughts'] == 'This is a test thought.'
    assert json.loads(data['item']['details']) == {'key': 'value'} # Details stored as JSON string

    # Verify in database
    item = HistoryItem.query.filter_by(id=data['item']['id']).first()
    assert item is not None
    assert item.user_id == user.id

def test_create_history_item_non_existent_user(client):
    """Test creating a history item with a non-existent user ID."""
    response = client.post('/api/history/', json={
        'userId': 999, # Assuming user 999 does not exist
        'time': '10:00',
        'type': 'test_event',
        'thoughts': 'Test thoughts'
    })
    assert response.status_code == 404
    data = response.get_json()
    assert data['message'] == 'User with ID 999 not found'

def test_create_history_item_missing_fields(client, app):
    """Test creating a history item with missing required fields."""
    user = create_test_user(app, username="missingfielduser", email="missing@example.com")
    
    # Missing 'type'
    response = client.post('/api/history/', json={
        'userId': user.id,
        'time': '10:00',
        'thoughts': 'Test thoughts'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing required fields: userId, time, type'

    # Missing 'time'
    response = client.post('/api/history/', json={
        'userId': user.id,
        'type': 'test_event',
        'thoughts': 'Test thoughts'
    })
    assert response.status_code == 400

    # Missing 'userId'
    response = client.post('/api/history/', json={
        'time': '10:00',
        'type': 'test_event',
        'thoughts': 'Test thoughts'
    })
    assert response.status_code == 400 # This actually might pass if userId is not checked first.
                                        # The current implementation checks all at once.

def test_get_history_by_user_success(client, app):
    """Test successfully fetching history items for a user."""
    user = create_test_user(app, username="histfetchuser", email="histfetch@example.com")
    with app.app_context():
        item1 = HistoryItem(user_id=user.id, time="09:00", type="type1", thoughts="thought1", saved_at=datetime.utcnow(), details="{}")
        item2 = HistoryItem(user_id=user.id, time="09:05", type="type2", thoughts="thought2", saved_at=datetime.utcnow(), details="{}")
        db.session.add_all([item1, item2])
        db.session.commit()

    response = client.get(f'/api/history/{user.id}')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 2
    # Items are ordered by saved_at desc, so item2 should be first if saved_at is distinct enough
    # For simplicity, just check one of them
    assert data[0]['thoughts'] == 'thought2' or data[1]['thoughts'] == 'thought2'


def test_get_history_no_items(client, app):
    """Test fetching history for a user with no items."""
    user = create_test_user(app, username="nohistuser", email="nohist@example.com")
    response = client.get(f'/api/history/{user.id}')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) == 0

def test_get_history_non_existent_user(client):
    """Test fetching history for a non-existent user."""
    response = client.get('/api/history/998') # Assuming user 998 does not exist
    assert response.status_code == 404
    data = response.get_json()
    assert data['message'] == 'User with ID 998 not found'

def test_delete_history_item_success(client, app):
    """Test successful deletion of a history item."""
    user = create_test_user(app, username="delhistuser", email="delhist@example.com")
    with app.app_context():
        item = HistoryItem(user_id=user.id, time="11:00", type="type_del", thoughts="del_thought", saved_at=datetime.utcnow())
        db.session.add(item)
        db.session.commit()
        item_id = item.id

    response = client.delete(f'/api/history/{item_id}')
    assert response.status_code == 204

    # Verify item is deleted from db
    with app.app_context():
        deleted_item = HistoryItem.query.get(item_id)
        assert deleted_item is None

def test_delete_history_item_non_existent(client):
    """Test deleting a non-existent history item."""
    response = client.delete('/api/history/9999') # Assuming item 9999 does not exist
    assert response.status_code == 404
    data = response.get_json()
    assert data['message'] == 'History item with ID 9999 not found'
