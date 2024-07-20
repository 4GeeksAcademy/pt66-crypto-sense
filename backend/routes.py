"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from backend.models import db, User
from flask_cors import CORS



api = Blueprint('api', __name__, url_prefix="/api")

# Allow CORS requests to this API
CORS(api)

@api.route('/register',methods=['POST'])
def register():
    data=request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already taken"}), 400

    if not validate_password(password):
        return jsonify({"msg": "Password does not meet criteria"}), 400
    
    user = User(first_name=first_name, last_name=last_name, username=username, email=email)
    user.password = password
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    result = [user.serialize() for user in users]
    return jsonify(result), 200


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200
