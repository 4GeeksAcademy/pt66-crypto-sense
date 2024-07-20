from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import generate_password_hash, check_password_hash

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
            "is_active": self.is_active
        }

    def from_dict(self, data, new_user=False):
        for field in ['first_name', 'last_name', 'email', 'username']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.password = data['password']

class Favorite(db.Model):
    __tablename__ = "favorites"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    coin_id = db.Column(db.String(80), nullable=False)
    user = db.relationship("User", back_populates="favorites", uselist=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "coin_id": self.coin_id,
            "user_id": self.user_id
        }