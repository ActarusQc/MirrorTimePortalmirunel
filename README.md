# Project Title: Mirror Hour Backend (Python)

## 1. Project Overview

This project is a Python-based backend application designed to manage user data, historical interaction records, and provide analysis related to mirror hours and associated messages. It utilizes Flask as the web framework, SQLAlchemy for database interaction with a MySQL database, and integrates with the OpenAI API for textual analysis features.

This backend serves as the data and logic layer for applications that track and interpret synchronicities like mirror hours.

## 2. Prerequisites

Before you begin, ensure you have the following installed:

*   **Python 3.x** (3.7 or higher recommended)
*   **MySQL Server**: An instance of MySQL server installed and running.
*   **OpenAI API Key**: Required if you plan to use the time/message analysis feature. You can obtain one from [OpenAI](https://openai.com/keys/).

## 3. Setup Instructions

Follow these steps to get the application running locally:

### 3.1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_directory>
```

### 3.2. Create and Activate a Python Virtual Environment

It's highly recommended to use a virtual environment to manage project dependencies.

*   **On macOS and Linux:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
*   **On Windows:**
    ```bash
    python -m venv venv
    venv\Scripts\activate
    ```

### 3.3. Install Dependencies

Install all required Python packages:

```bash
pip install -r requirements.txt
```

### 3.4. Configure Environment Variables (.env file)

The application uses a `.env` file to manage environment-specific configurations.

1.  **Create the `.env` file**:
    You can copy the provided example if available, or create a new file named `.env` in the root of the project.

    ```bash
    # Example: touch .env (if you don't have an example to copy)
    ```

2.  **Edit the `.env` file** with the following content, replacing placeholders with your actual values:

    ```env
    # Database Configuration
    # Replace with your MySQL connection details
    # Format: mysql+mysqlconnector://<user>:<password>@<host>/<database_name>
    DATABASE_URL="mysql+mysqlconnector://root:your_password@localhost/mirror_hour_db"

    # OpenAI API Key
    # Required for the analysis feature. Leave blank if not using.
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

    *   **`DATABASE_URL`**: Specifies the connection string for your MySQL database. Ensure the database (`mirror_hour_db` in the example) exists on your MySQL server.
    *   **`OPENAI_API_KEY`**: Your secret API key from OpenAI.

### 3.5. Create Database Schema

Once the `.env` file is configured with the correct `DATABASE_URL`, create the database tables using the Flask CLI command:

```bash
# Ensure your virtual environment is activated
# and you are in the project root directory
FLASK_APP=run.py flask create-tables
```
This command will connect to your MySQL database and create all necessary tables based on the SQLAlchemy models.

### 3.6. (Optional) Migrate Initial Data

If you have existing data from a previous system (e.g., the `backup_replit.sql` file provided with this project), you can migrate it using the `migrate_data.py` script:

```bash
python migrate_data.py
```
This script parses the `backup_replit.sql` file (expected in the project root) and populates the `users` and `history_items` tables in your MySQL database. This step is optional and only relevant if you have such a backup file.

## 4. Running the Application

To start the Flask development server:

```bash
# Ensure your virtual environment is activated
FLASK_APP=run.py flask run
```
Alternatively, you can run:
```bash
python run.py
```

The application will typically be available at `http://127.0.0.1:5000/`.

## 5. Running Tests

The project uses `pytest` for running unit and integration tests. Ensure you have installed the development dependencies (which are included in `requirements.txt`).

To run the tests:

```bash
pytest
```
This command will discover and run all tests located in the `tests/` directory.

## 6. Project Structure

A brief overview of the key directories and files:

```
.
├── app/                  # Main application package
│   ├── __init__.py       # Application factory (create_app)
│   ├── models/           # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── history_item.py
│   ├── routes/           # API endpoint definitions (Blueprints)
│   │   ├── __init__.py
│   │   ├── auth.py       # Authentication routes (/api/users)
│   │   ├── history.py    # History item routes (/api/history)
│   │   └── analysis.py   # Analysis routes (/api/analyze)
│   └── services/         # (If you had services, e.g., OpenAI service logic)
├── tests/                # Unit and integration tests
│   ├── __init__.py
│   ├── conftest.py       # Pytest fixtures and configuration
│   ├── test_auth.py
│   ├── test_history.py
│   └── test_analysis.py
├── .env                  # Local environment variables (created by you, gitignored)
├── requirements.txt      # Python package dependencies
├── backup_replit.sql     # Example SQL dump for data migration
├── manage.py             # Custom Flask CLI commands (e.g., create-tables)
├── migrate_data.py       # Script for migrating data from backup_replit.sql
├── run.py                # Entry point to run the Flask application
└── README.md             # This file
```

## 7. API Endpoints

(Details of API endpoints can be added here or in a separate API documentation file if desired.)

*   **Authentication**: `/api/users/register`, `/api/users/login`
*   **History**: `/api/history/`, `/api/history/<user_id>`, `/api/history/<item_id>`
*   **Analysis**: `/api/analyze/`

---

This README provides a comprehensive guide to setting up, running, and testing the application.
If you encounter any issues, please ensure your prerequisites are met and environment variables are correctly configured.
```
