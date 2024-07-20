"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from backend.models import db, User, Favorite
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

api = Blueprint('api', __name__, url_prefix="/api")

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/token', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid input"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and Password are Required"}), 400

        user = User.query.filter_by(email=email).first()
        if user is None or not user.check_password_hash(password):
            return jsonify({"message": "Email or password invalid"}), 400

        token = create_access_token(identity=user)
        response_body = {
            "token": token,
            "user": user.serialize()
        }
        return jsonify(response_body), 201

    except Exception as e:
        return jsonify({"message": "Internal server error"}), 500

@api.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 400
    return jsonify({
        "user": {
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active
        }
    }), 200