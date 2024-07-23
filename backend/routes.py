import sqlalchemy as sa
from flask import Blueprint, request, jsonify, url_for, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

api = Blueprint('api', __name__, url_prefix='/api')

# Allow CORS requests to this API
CORS(api)

@api.route('/users/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    return jsonify(db.get_or_404(User, id).to_dict())

@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    result = [user.to_dict() for user in users]
    return jsonify(result), 200

@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    if 'username' not in data or 'email' not in data or 'password' not in data or 'first_name' not in data or 'last_name' not in data:
        return jsonify({'error': 'must include username, email, password, first name, and last name fields'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Please use a different username'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Please use a different email address'}), 400

    user = User()
    user.from_dict(data, new_user=True)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201, {'Location': url_for('api.get_user', id=user.id)}

@api.route('/users/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    current_user_id = get_jwt_identity()
    if current_user_id != id:
        abort(403)

    user = db.get_or_404(User, id)
    data = request.get_json()

    if 'username' in data and data['username'] != user.username and \
            User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Please use a different username'}), 400

    if 'email' in data and data['email'] != user.email and \
            User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Please use a different email address'}), 400

    user.from_dict(data, new_user=False)
    db.session.commit()
    return jsonify(user.to_dict())

# @api.route('/favorites', methods=['POST'])
# @jwt_required()
# def add_favorite():
#     user_id = get_jwt_identity()
#     data = request.get_json()
#     coin_id = data.get('coin_id')

#     if not coin_id:
#         return jsonify({'error': 'coin_id is required'}), 400

#     favorite = Favorite(user_id=user_id, coin_id=coin_id)
#     db.session.add(favorite)
#     db.session.commit()

#     return jsonify(favorite.serialize()), 201

# @api.route('/favorites', methods=['GET'])
# @jwt_required()
# def get_favorites():
#     user_id = get_jwt_identity()
#     favorites = Favorite.query.filter_by(user_id=user_id).all()
#     return jsonify([favorite.serialize() for favorite in favorites])

# @api.route('/favorites/<int:id>', methods=['DELETE'])
# @jwt_required()
# def delete_favorite(id):
#     user_id = get_jwt_identity()
#     favorite = Favorite.query.filter_by(user_id=user_id, id=id).first()

#     if not favorite:
#         return jsonify({'error': 'Favorite not found'}), 404

#     db.session.delete(favorite)
#     db.session.commit()
#     return '', 204

@api.route('/token', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid input"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and Password are Required"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"message": "Email or password invalid"}), 400

    token = create_access_token(identity=user)
    response_body = {
        "token": token,
        "user": user.to_dict()
    }
    return jsonify(response_body), 201

    # except Exception as e:
    #     return jsonify({"message": "Internal server error"}), 500

# @api.route('/user', methods=['GET'])
# @jwt_required()
# def get_user():
#     user_id = get_jwt_identity()
#     user = User.query.get(user_id)

#     if not user:
#         return jsonify({"message": "User not found"}), 400
#     return jsonify({
#         "user": {
#             "email": user.email,
#             "username": user.username,
#             "is_active": user.is_active
#         }
#     }), 200