# Materials Accounting System - Backend

This is the backend for the Materials Accounting System, built with Flask, SQLAlchemy, and GraphQL.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following content:
```
FLASK_APP=app
FLASK_ENV=development
DATABASE_URI=sqlite:///materials.db
```

4. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

5. Run the application:
```bash
flask run
```

The GraphQL API will be available at http://localhost:5000/graphql
