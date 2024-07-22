import sqlalchemy as sa
from flask import Blueprint, request, jsonify, url_for, abort
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token, create_refresh_token, jwt_refresh_token_required, unset_jwt_cookies
from models import db, User, Favorite
from flask_cors import CORS
from flask_talisman import Talisman
from flask import current_app
from datetime import timedelta

api = Blueprint('api', __name__, url_prefix='/api')

# Allow CORS requests to this API
CORS(api)

# Add Talisman for secure headers
# This helps protect against various web vulnerabilities
talisman = Talisman(api)

# Initialize JWT for handling JSON Web Tokens
jwt = JWTManager()

# Global error handler
# This catches all exceptions and returns them as JSON responses
@api.errorhandler(Exception)
def handle_error(e):
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    return jsonify(error=str(e)), code

# Existing routes...

# New route for user login
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.authenticate(data.get('username'), data.get('password'))
    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401
    # Create both access and refresh tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({'access_token': access_token, 'refresh_token': refresh_token}), 200

# New route for user logout
@api.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"msg": "logout successful"})
    # Remove JWT cookies
    unset_jwt_cookies(response)
    return response

# New route for refreshing access tokens
@api.route('/refresh', methods=['POST'])
@jwt_refresh_token_required
def refresh():
    current_user = get_jwt_identity()
    ret = {
        'access_token': create_access_token(identity=current_user)
    }
    return jsonify(ret), 200

# New route for requesting a password reset
@api.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user:
        token = user.generate_password_reset_token()
        # TODO: Send email with reset link (token)
    # Always return a 200 status to prevent email enumeration
    return jsonify({"message": "If the email exists, a reset link has been sent."}), 200

# New route for resetting the password
@api.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.verify_password_reset_token(data.get('token')):
        user.reset_password(data.get('new_password'))
        return jsonify({"message": "Password has been reset successfully."}), 200
    return jsonify({"error": "Invalid or expired token."}), 400

# New route for verifying email
@api.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    user = User.query.filter_by(email_verification_token=token).first()
    if user and user.verify_email(token):
        return jsonify({"message": "Email verified successfully."}), 200
    return jsonify({"error": "Invalid or expired token."}), 400

# New route for resending verification email
@api.route('/resend-verification-email', methods=['POST'])
@jwt_required()
def resend_verification_email():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user and not user.is_email_verified:
        token = user.generate_email_verification_token()
        # TODO: Send verification email with token
        return jsonify({"message": "Verification email sent."}), 200
    return jsonify({"error": "User not found or already verified."}), 400

# JWT configuration
# These handlers customize the responses for expired or invalid tokens
@jwt.expired_token_loader
def expired_token_callback():
    return jsonify({
        'status': 401,
        'sub_status': 42,
        'msg': 'The token has expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'status': 401,
        'sub_status': 43,
        'msg': 'Invalid token'
    }), 401