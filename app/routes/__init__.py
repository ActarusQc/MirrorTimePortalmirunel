from .auth import auth_bp

from .history import history_bp
from .analysis import analysis_bp

# A list or tuple of all blueprints from the 'routes' module
all_blueprints = (
    auth_bp,
    history_bp,
    analysis_bp,
    # Add other blueprints here as they are created
)
