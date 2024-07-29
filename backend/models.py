from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from sqlalchemy import UniqueConstraint
import secrets


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password = db.Column(db.String(250), nullable=False)
    username = db.Column(db.String(80), nullable=False, unique=True)
    is_active = db.Column(db.Boolean(), nullable=False, default=True)
    favorites = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), 
                           onupdate=lambda: datetime.now(timezone.utc))
    reset_token = db.Column(db.String(100), unique=True, nullable=True)
    reset_token_expiration = db.Column(db.DateTime(timezone=True), nullable=True, 
                                        default=lambda: datetime.now(timezone.utc) + timedelta(hours=1))

    @hybrid_property
    def password(self):
        return self._password

    @password.setter
    def password(self, password):
        self._password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self._password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "username": self.username,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def from_dict(self, data, new_user=False):
        for field in ['first_name', 'last_name', 'email', 'username', 'role']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.password = data['password']

    def generate_reset_token(self):
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expiration = datetime.now(timezone.utc) + timedelta(hours=1)
        db.session.commit()
        return self.reset_token
    
    def verify_reset_token(self, token):
        if token != self.reset_token or self.reset_token_expiration < datetime.now(timezone.utc):
            return False
        return True
    
    def reset_password(self, new_password):
        self.password = new_password
        self.password_reset_token = None
        self.password_reset_expiration = None
        db.session.commit()

    



class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id')
    )

    coin_id = db.Column(
        db.String(80),
        nullable=False,
        
    )

    user = db.relationship(
        "User",
        back_populates="favorites",
        uselist=False
    )

    __table_args__ = (UniqueConstraint('user_id', 'coin_id', name='_user_coin_uc'),)

    def serialize(self):
        return {
            "id": self.id,
            "coin_id": self.coin_id,
            "user_id": self.user_id
        }
