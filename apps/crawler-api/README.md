# Crawler API

A FastAPI application with SQLModel integration for database operations and Temporal for workflow orchestration.

## Features

- FastAPI web framework
- SQLModel for database models and ORM
- MySQL database (when using Docker Compose) or SQLite (for local development)
- Pydantic for data validation
- Temporal for workflow orchestration

## Setup

### Local Development

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python main.py
   ```

### Using Docker Compose

1. Make sure you have Docker and Docker Compose installed on your system.

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

3. The application will be available at http://localhost:8000

4. To stop the containers:
   ```
   docker-compose down
   ```

5. To stop the containers and remove the volumes (this will delete all data in the MySQL database):
   ```
   docker-compose down -v
   ```

## Project Structure

- `main.py`: FastAPI application with API endpoints
- `models.py`: SQLModel and Pydantic models
- `database.py`: Database connection and session management
- `temporal_client.py`: Temporal client for workflow orchestration
- `crawler_workflows/`: Directory for workflow definitions
- `Dockerfile`: Docker configuration for the application
- `docker-compose.yml`: Docker Compose configuration for the application and MySQL

## API Endpoints

### User Endpoints

- `POST /users/`: Create a new user
- `GET /users/`: List all users
- `GET /users/{user_id}`: Get a specific user

### Item Endpoints

- `POST /items/`: Create a new item
- `GET /items/`: List all items
- `GET /items/{item_id}`: Get a specific item

### Workflow Endpoints

- `POST /workflow-test/{name}`: Test workflow endpoint

## Using SQLModel with Pydantic

This project demonstrates how to use SQLModel alongside Pydantic:

1. SQLModel is used for database models (tables) in `models.py`
2. Pydantic models are used for API request/response schemas
3. SQLModel inherits from Pydantic, allowing for seamless integration

Example:
```python
# Database model (SQLModel)
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str

# API schema (Pydantic)
class UserCreate(SQLModel):
    username: str
    email: str
```

## Testing

Use the `test_main.http` file to test the API endpoints.
