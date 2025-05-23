import click
from flask.cli import with_appcontext
from app import create_app, db
from app.models import User, HistoryItem # Ensure models are imported

@click.command('create-tables')
@with_appcontext
def create_tables_command():
    """Create all database tables."""
    # Need to ensure all models are imported before calling db.create_all()
    # This is typically done by importing them in app.models.__init__
    # and then ensuring app.models is imported somewhere before create_all
    # or by importing them directly here as done above.
    
    # The create_app() function returns the app instance
    current_app = create_app()
    
    with current_app.app_context():
        db.create_all()
        click.echo('Database tables created successfully!')

if __name__ == '__main__':
    # This setup allows running `python manage.py create-tables`
    # It requires Flask to be installed and discoverable.
    # For a more robust CLI, Flask-Script or integrating with Flask's own CLI (as above) is better.
    # The current setup with @click.command and @with_appcontext is good.
    
    # To make this runnable directly, we need to create a FlaskGroup or similar
    # or call the command directly. For simplicity, let's assume it's run via Flask CLI
    # or a custom script runner that sets up the app context.
    
    # For direct execution like `python manage.py create-tables`:
    # We need to ensure the app context is available.
    # One way is to create a dummy app instance here for the CLI.
    app = create_app()
    app.cli.add_command(create_tables_command)
    
    # This part makes `python manage.py ...` commands work.
    # However, the standard way to run click commands with Flask is `flask ...`
    # To enable `flask create-tables`, we need to register this command
    # with the app's cli runner, often done in app.py or run.py for Flask versions < 2.x
    # or by setting FLASK_APP and running `flask create-tables`.

    # Let's adjust `run.py` later if needed to register this for `flask` command.
    # For now, `python manage.py create-tables` won't work directly without more setup.
    # The @click.command is designed for `flask ...` commands.

    # Let's simplify for now and ensure `flask create-tables` can be made to work.
    # The script would typically be run via `FLASK_APP=run.py flask create-tables`.
    # To make `python manage.py create-tables` work, we need a bit more:
    
    # A simple way to enable `python manage.py create-tables`:
    # Create a dummy app for the command context if run directly.
    # This is a bit of a workaround for direct script execution.
    # The Flask CLI (FLASK_APP=run.py flask create-tables) is cleaner.

    # Let's assume we'll use Flask CLI. The command is defined.
    # We might need to register it in `run.py` or ensure FLASK_APP points to `manage.py`
    # if we want `flask create-tables`.

    # If `manage.py` is set as `FLASK_APP`, then `flask create-tables` will work.
    # Let's add the necessary lines to `run.py` to register the command with the app instance,
    # so `flask create-tables` works when `FLASK_APP=run.py`.

    pass # The command definition is the key part. Actual running will be via Flask CLI.


# To make `python manage.py create-tables` work directly:
# We need to manually invoke the command with an app context.
# This is not the standard way but can be done for simplicity if Flask CLI setup is an issue.

def main():
    app = create_app()
    with app.app_context():
        # This is not how click commands are usually run.
        # create_tables_command() # This would try to run it without CLI parsing.
        # Instead, we use app.cli.main() or similar if we want to make this script the CLI entry point.
        pass

# The @click.command is intended to be discovered by Flask's CLI runner.
# If you set FLASK_APP=manage.py (and manage.py creates an app instance),
# then `flask create-tables` would work.
# Or, register this command on the app instance in run.py.
# Let's do the latter. I'll modify run.py next.

# For now, this file defines the command.
# The important part is the `create_tables_command` function.
# I will modify `run.py` to register this command.
# This file `manage.py` will then primarily be a place to define such commands.
# We can also add a simple `if __name__ == '__main__':` to run it, but it's better to use Flask CLI.

# Let's ensure the User and HistoryItem are available in db.metadata for create_all
# by importing them. This is done at the top.
# `from app.models import User, HistoryItem`
# And `app.models.__init__` ensures they are loaded.
# The `db.create_all()` command will then create tables for all registered models.
# The application context `with current_app.app_context():` is crucial.
# The `@with_appcontext` decorator handles this for Flask CLI commands.The `manage.py` file now defines the `create-tables` command.
To make this command runnable via `flask create-tables` (when `FLASK_APP=run.py`), I need to register this command with the Flask app instance in `run.py`.

I will now modify `run.py` to include this registration.
