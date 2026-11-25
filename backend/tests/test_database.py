import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from backend.app.models.user import User
from backend.app.models.prediction import Prediction
from backend.app.models.environmental_data import EnvironmentalData
from backend.app.models.dataset import EnvironmentalDataset
from backend.app.services.auth_service import get_password_hash

def test_database_user_crud(db):
    # 1. Create
    user = User(
        name="DB Test User",
        email="dbtest@airguard.com",
        hashed_password=get_password_hash("Secret@123"),
        role="user",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.id is not None

    # 2. Read
    fetched = db.query(User).filter(User.email == "dbtest@airguard.com").first()
    assert fetched is not None
    assert fetched.name == "DB Test User"

    # 3. Update
    fetched.name = "DB Test User Updated"
    db.commit()
    db.refresh(fetched)
    assert fetched.name == "DB Test User Updated"

    # 4. Delete
    db.delete(fetched)
    db.commit()
    deleted = db.query(User).filter(User.email == "dbtest@airguard.com").first()
    assert deleted is None

def test_database_prediction_foreign_key_and_cascade(db):
    user = User(
        name="FK User",
        email="fkuser@airguard.com",
        hashed_password=get_password_hash("Secret@123"),
        role="user",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    env = EnvironmentalData(
        user_id=user.id,
        pm25=25.0,
        pm10=50.0,
        no2=15.0,
        so2=5.0,
        co=0.5,
        o3=20.0,
        temperature=25.0,
        humidity=50.0
    )
    db.add(env)
    db.commit()
    db.refresh(env)

    pred = Prediction(
        user_id=user.id,
        environmental_data_id=env.id,
        predicted_aqi=45.0,
        category="Good",
        health_recommendation="Air quality is ideal.",
        model_used="Random Forest Regression"
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)

    assert pred.id is not None
    assert pred.environmental_data.pm25 == 25.0
    assert pred.user.email == "fkuser@airguard.com"

    # Safe deletion: delete prediction first, then environmental record
    pred_id = pred.id
    env_id = env.id
    db.delete(pred)
    db.flush()
    db.delete(env)
    db.commit()

    assert db.query(Prediction).filter(Prediction.id == pred_id).first() is None
    assert db.query(EnvironmentalData).filter(EnvironmentalData.id == env_id).first() is None

def test_database_duplicate_email_constraint(db):
    u1 = User(
        name="User 1",
        email="duplicate@airguard.com",
        hashed_password=get_password_hash("Secret@123"),
        role="user"
    )
    db.add(u1)
    db.commit()

    u2 = User(
        name="User 2",
        email="duplicate@airguard.com",
        hashed_password=get_password_hash("Secret@456"),
        role="user"
    )
    db.add(u2)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()

def test_database_dataset_model(db):
    dataset = EnvironmentalDataset(
        name="Test CPCB Dataset",
        source="Central Pollution Control Board",
        record_count=12000,
        file_path="/mock/path.csv",
        description="Test dataset for validation"
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    assert dataset.id is not None
    assert dataset.record_count == 12000
    assert dataset.created_at is not None
