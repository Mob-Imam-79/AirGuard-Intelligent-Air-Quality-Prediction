import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.services.auth_service import get_password_hash
from backend.app.models.user import User

# In-memory test SQLite engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Pre-seed admin and test user
    admin_user = User(
        name="Admin Test",
        email="testadmin@airguard.com",
        hashed_password=get_password_hash("TestAdmin@123"),
        role="admin",
        is_active=True
    )
    test_user = User(
        name="Regular User",
        email="testuser@airguard.com",
        hashed_password=get_password_hash("TestUser@123"),
        role="user",
        is_active=True
    )
    session.add(admin_user)
    session.add(test_user)
    session.commit()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

