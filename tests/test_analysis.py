import json
import os
from unittest.mock import patch, MagicMock

# Store original API key to restore it later
ORIGINAL_OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

def setup_module(module):
    """ Setup any state specific to the execution of the given module."""
    # Ensure OPENAI_API_KEY is set for most tests by default
    if ORIGINAL_OPENAI_API_KEY is None: # If it was never set, set a dummy one for tests
        os.environ["OPENAI_API_KEY"] = "test_api_key_value"

def teardown_module(module):
    """ Teardown any state that was previously setup with a setup_module
    method.
    """
    # Restore original OPENAI_API_KEY
    if ORIGINAL_OPENAI_API_KEY is not None:
        os.environ["OPENAI_API_KEY"] = ORIGINAL_OPENAI_API_KEY
    elif "OPENAI_API_KEY" in os.environ: # If it was set by setup_module
        del os.environ["OPENAI_API_KEY"]


@patch('openai.OpenAI') # Patch the client initialization
def test_analyze_success(MockOpenAI, client):
    """Test successful analysis call."""
    # Configure the mock client and its methods
    mock_completion_instance = MagicMock()
    mock_completion_instance.choices = [MagicMock(message=MagicMock(content="This is a mock analysis."))]
    
    mock_openai_instance = MockOpenAI.return_value # This is the instance of OpenAI()
    mock_openai_instance.chat.completions.create.return_value = mock_completion_instance

    response = client.post('/api/analyze/', json={
        'time': '10:10',
        'message': 'Test message',
        'language': 'en'
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'analysis' in data
    assert data['analysis'] == "This is a mock analysis."
    
    # Check if OpenAI client was initialized and called
    MockOpenAI.assert_called_once_with(api_key=os.environ.get("OPENAI_API_KEY"))
    mock_openai_instance.chat.completions.create.assert_called_once()


@patch('openai.OpenAI')
def test_analyze_success_french(MockOpenAI, client):
    """Test successful analysis call in French."""
    mock_completion_instance = MagicMock()
    mock_completion_instance.choices = [MagicMock(message=MagicMock(content="Ceci est une analyse simulée."))]
    
    mock_openai_instance = MockOpenAI.return_value
    mock_openai_instance.chat.completions.create.return_value = mock_completion_instance

    response = client.post('/api/analyze/', json={
        'time': '11:11',
        'message': 'Message de test',
        'language': 'fr'
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['analysis'] == "Ceci est une analyse simulée."
    mock_openai_instance.chat.completions.create.assert_called_once()
    # You could also assert the prompt content if needed by inspecting the call args
    # e.g., args, kwargs = mock_openai_instance.chat.completions.create.call_args
    # assert "Heure: 11:11" in kwargs['messages'][1]['content']


def test_analyze_missing_time(client):
    """Test analysis call with missing 'time' field."""
    response = client.post('/api/analyze/', json={
        'message': 'Test message'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['message'] == 'Missing required field: time'

@patch('openai.OpenAI') # Still need to patch so it doesn't try to init with a bad key
def test_analyze_missing_api_key(MockOpenAI, client, monkeypatch):
    """Test analysis call when OPENAI_API_KEY is not set."""
    # Temporarily remove the API key for this test
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    
    response = client.post('/api/analyze/', json={
        'time': '12:12',
        'message': 'Test message'
    })
    
    assert response.status_code == 500 # As per current implementation
    data = response.get_json()
    assert data['message'] == 'OpenAI API key not configured. Please contact administrator.'
    
    # Ensure OpenAI client was not even attempted to be used if key is missing
    MockOpenAI.return_value.chat.completions.create.assert_not_called()


@patch('openai.OpenAI')
def test_analyze_openai_api_error(MockOpenAI, client):
    """Test handling of OpenAI API errors."""
    mock_openai_instance = MockOpenAI.return_value
    # Simulate an API error from OpenAI
    from openai import APIError # Import the specific error type
    mock_openai_instance.chat.completions.create.side_effect = APIError("Simulated API Error", request=None, body=None)

    response = client.post('/api/analyze/', json={
        'time': '13:13',
        'message': 'Error test'
    })
    
    assert response.status_code == 503 # Service Unavailable
    data = response.get_json()
    assert 'Failed to get analysis from OpenAI due to API error.' in data['message']
    assert "Simulated API Error" in data['error']


@patch('openai.OpenAI')
def test_analyze_openai_general_exception(MockOpenAI, client):
    """Test handling of other exceptions during OpenAI call."""
    mock_openai_instance = MockOpenAI.return_value
    mock_openai_instance.chat.completions.create.side_effect = Exception("Generic unexpected error")

    response = client.post('/api/analyze/', json={
        'time': '14:14',
        'message': 'Exception test'
    })
    
    assert response.status_code == 500
    data = response.get_json()
    assert 'Failed to get analysis from OpenAI.' in data['message']
    assert "Generic unexpected error" in data['error']
