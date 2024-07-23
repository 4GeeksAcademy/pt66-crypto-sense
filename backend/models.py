from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
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
    # favorites = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

    # New fields for password reset 
    password_reset_token = db.Column(db.String(100), unique=True, nullable=True)
    password_reset_expiration = db.Column(db.DateTime, nullable=True)

    # New fields for email verification 
    is_email_verified = db.Column(db.Boolean, default=False)
    email_verification_token = db.Column(db.String(100), unique=True, nullable=True)

    # New field for user role
    role = db.Column(db.String(20), nullable=False, default='user')

    # New fields for timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
            "role": self.role,
            "is_email_verified": self.is_email_verified,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def from_dict(self, data, new_user=False):
        for field in ['first_name', 'last_name', 'email', 'username', 'role']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.password = data['password']

    # New method for user authentication (8)
    @classmethod
    def authenticate(cls, username_or_email, password):
        user = cls.query.filter(db.or_(User.username == username_or_email, User.email == username_or_email)).first()
        if user and user.check_password(password):
            return user
        return None

    # New methods for password reset
    def generate_password_reset_token(self):
        self.password_reset_token = secrets.token_urlsafe(32)
        self.password_reset_expiration = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()
        return self.password_reset_token

    def verify_password_reset_token(self, token):
        if self.password_reset_token != token:
            return False
        if datetime.utcnow() > self.password_reset_expiration:
            return False
        return True

    def reset_password(self, new_password):
        self.password = new_password
        self.password_reset_token = None
        self.password_reset_expiration = None
        db.session.commit()

    # New methods for email verification
    def generate_email_verification_token(self):
        self.email_verification_token = secrets.token_urlsafe(32)
        db.session.commit()
        return self.email_verification_token

    def verify_email(self, token):
        if self.email_verification_token != token:
            return False
        self.is_email_verified = True
        self.email_verification_token = None
        db.session.commit()
        return True