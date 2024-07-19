from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import (
    generate_password_hash, check_password_hash
)
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
    favorites = db.relationship("Favorite", back_populates="user", uselist=True)

    @hybrid_property
    def password(self):
        return self._password
    
    @password.setter
    def password(self, password):
        self._password = generate_password_hash(password)

    def check_password_hash(self, other):
        return check_password_hash(self._password, other)    

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }

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
        unique=True
        )
    user = db.relationship(
        "User",
        back_populates="favorites",
        uselist=False
    )
    
    def serialize(self):
        return {
            "id": self.id,
            "coin_id": self.coin_id,
            "user_id": self.user_id
        }