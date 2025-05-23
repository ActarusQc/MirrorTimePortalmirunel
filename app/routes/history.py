from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from app.models.history_item import HistoryItem
from datetime import datetime
import json # For handling details if it's an object

history_bp = Blueprint('history_bp', __name__, url_prefix='/api/history')

@history_bp.route('/', methods=['POST'])
def create_history_item():
    data = request.get_json()

    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400

    user_id = data.get('userId')
    time_str = data.get('time') # Assuming time is a string like "10:00 AM"
    item_type = data.get('type')
    thoughts = data.get('thoughts') # Optional
    details = data.get('details')   # Optional, can be JSON object or string

    if not all([user_id, time_str, item_type]):
        return jsonify({'message': 'Missing required fields: userId, time, type'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': f'User with ID {user_id} not found'}), 404

    # Handle 'details': if it's a dict/list, stringify it.
    # The model expects Text, so a string is appropriate.
    details_str = None
    if details is not None:
        if isinstance(details, (dict, list)):
            details_str = json.dumps(details)
        else:
            details_str = str(details)
        # Optional: Truncate details if necessary, e.g., details_str = details_str[:5000]

    new_item = HistoryItem(
        user_id=user_id,
        time=time_str,
        type=item_type,
        thoughts=thoughts,
        details=details_str,
        saved_at=datetime.utcnow() # Set saved_at to current UTC time
    )

    try:
        db.session.add(new_item)
        db.session.commit()
        # Return the created item's data
        item_data = {
            'id': new_item.id,
            'userId': new_item.user_id,
            'time': new_item.time,
            'type': new_item.type,
            'thoughts': new_item.thoughts,
            'details': new_item.details, # Or json.loads(new_item.details) if it was stored as JSON string and client expects object
            'saved_at': new_item.saved_at.isoformat()
        }
        return jsonify({'message': 'History item created successfully', 'item': item_data}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create history item: {str(e)}")
        return jsonify({'message': 'Failed to create history item', 'error': str(e)}), 500


@history_bp.route('/<int:user_id>', methods=['GET'])
def get_history_by_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': f'User with ID {user_id} not found'}), 404

    history_items = HistoryItem.query.filter_by(user_id=user_id).order_by(HistoryItem.saved_at.desc()).all()
    
    items_data = []
    for item in history_items:
        items_data.append({
            'id': item.id,
            'userId': item.user_id,
            'time': item.time,
            'type': item.type,
            'thoughts': item.thoughts,
            'details': item.details, # Or json.loads(item.details) if it's a JSON string and client expects object
            'saved_at': item.saved_at.isoformat()
        })
    
    return jsonify(items_data), 200


@history_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    history_item = HistoryItem.query.get(item_id)
    if not history_item:
        return jsonify({'message': f'History item with ID {item_id} not found'}), 404

    try:
        db.session.delete(history_item)
        db.session.commit()
        return '', 204  # No content
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to delete history item {item_id}: {str(e)}")
        return jsonify({'message': 'Failed to delete history item', 'error': str(e)}), 500
