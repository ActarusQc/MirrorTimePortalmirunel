from app import create_app

# Import the command from manage.py
try:
    from manage import create_tables_command
    commands_imported = True
except ImportError:
    commands_imported = False

app = create_app()

# Register the command with the Flask CLI runner
if commands_imported:
    app.cli.add_command(create_tables_command)
else:
    # Optionally print a warning or log if manage.py or the command is not found
    print("Warning: Could not import create_tables_command from manage.py. CLI command won't be available.")


if __name__ == '__main__':
    # Note: app.run() is for development server, not for running CLI commands.
    # CLI commands are run using `flask <command>` in the terminal,
    # e.g., `FLASK_APP=run.py flask create-tables`
    app.run(debug=True)
