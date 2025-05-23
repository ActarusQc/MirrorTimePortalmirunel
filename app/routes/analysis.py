from flask import Blueprint, request, jsonify, current_app
import os
import openai # Placeholder for the actual library name if different

analysis_bp = Blueprint('analysis_bp', __name__, url_prefix='/api/analyze')

@analysis_bp.route('/', methods=['POST'])
def analyze_time_message():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400

    time_str = data.get('time')
    message = data.get('message', None) # Optional
    language = data.get('language', 'en') # Optional, default 'en'

    if not time_str:
        return jsonify({'message': 'Missing required field: time'}), 400

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        current_app.logger.error("OPENAI_API_KEY not set in environment.")
        return jsonify({'message': 'OpenAI API key not configured. Please contact administrator.'}), 500

    try:
        client = openai.OpenAI(api_key=api_key)
    except Exception as e:
        current_app.logger.error(f"Failed to initialize OpenAI client: {str(e)}")
        return jsonify({'message': 'Failed to initialize OpenAI service.', 'error': str(e)}), 500


    # Construct the prompt
    if language == 'fr':
        message_placeholder = message if message else "Pas de message fourni"
        prompt = f"""Analysez l'heure miroir et le message suivants. Retournez une interprétation spirituelle concise et directe, sans commencer par "Interprétation en français:" :

Heure: {time_str}
Message: {message_placeholder}

Réponse:"""
    else: # Default to English
        message_placeholder = message if message else "No message provided"
        prompt = f"""Analyze the following mirror hour and message. Return a short spiritual interpretation:

Time: {time_str}
Message: {message_placeholder}

Response:"""

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a spiritual guide specializing in interpreting mirror hours and numerical synchronicities. Your analysis should be mystical, thoughtful, and personal."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.8
        )
        analysis_text = completion.choices[0].message.content
        return jsonify({"analysis": analysis_text.strip() if analysis_text else None})

    except openai.APIError as e: # More specific OpenAI errors
        current_app.logger.error(f"OpenAI API Error: {str(e)}")
        return jsonify({'message': 'Failed to get analysis from OpenAI due to API error.', 'error': str(e)}), 503 # Service Unavailable
    except Exception as e:
        current_app.logger.error(f"Error during OpenAI API call: {str(e)}")
        return jsonify({'message': 'Failed to get analysis from OpenAI.', 'error': str(e)}), 500
