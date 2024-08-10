import sqlalchemy as sa
import requests
import os
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify, url_for, abort
from backend.models import db, User, Favorite
from flask_cors import CORS
from backend.utils import send_reset_email
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

load_dotenv()

api = Blueprint('api', __name__, url_prefix='/api')

COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
CRYPTOCOMPARE_API_KEY = os.getenv('CRYPTOCOMPARE_API_KEY')
CRYPTOCOMPARE_API_URL = "https://min-api.cryptocompare.com/data/v2/news/"

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
    """
    payload:
    {
	    "username": "string",
	    "email": "string",
	    "password": "string",
	    "first_name": "string",
	    "last_name": "string"
    }
    """
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


@api.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    try:
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        
        if not current_user:
            return jsonify({'error': 'User not authenticated or not found'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided in the request'}), 400

        favorites_data = data.get('favorites')
        if not favorites_data or not isinstance(favorites_data, list):
            return jsonify({'error': 'Invalid or missing favorites list in the request'}), 400

        added_favorites = []
        existing_favorites = []
        invalid_favorites = []

        for favorite_item in favorites_data:
            coin_id = favorite_item.get('coin_id')
            
            if not coin_id:
                invalid_favorites.append(favorite_item)
                continue

            existing_favorite = Favorite.query.filter_by(user_id=current_user.id, coin_id=coin_id).first()
            if existing_favorite:
                existing_favorites.append(coin_id)
            else:
                favorite = Favorite(user_id=current_user.id, coin_id=coin_id)
                db.session.add(favorite)
                added_favorites.append(favorite)

        if invalid_favorites:
            db.session.rollback()
            return jsonify({
                'error': 'Some favorites are invalid',
                'invalid_favorites': invalid_favorites
            }), 400

        db.session.commit()

        return jsonify({
            'message': 'Favorites processed successfully',
            'added': [favorite.serialize() for favorite in added_favorites],
            'existing': existing_favorites,
            'total_added': len(added_favorites),
            'total_existing': len(existing_favorites)
        }), 201 if added_favorites else 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in add_favorite: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while adding favorites'}), 500

@api.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    try:
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)

        favorites = Favorite.query.filter_by(user_id=current_user.id).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'items': [favorite.serialize() for favorite in favorites.items],
            'total': favorites.total,
            'pages': favorites.pages,
            'current_page': favorites.page
        })
    except Exception as e:
        print(f"Error in get_favorites: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
@api.route('/favorites/<int:id>', methods=['GET'])
@jwt_required()
def get_favorite(id):
    try:
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        favorite = Favorite.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not favorite:
            return jsonify({'error': 'Favorite not found'}), 404

        return jsonify(favorite.serialize())
    except Exception as e:
        print(f"Error in get_favorite: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500


    
@api.route('/favorites/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(id):
    try:
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        
        if not current_user:
            return jsonify({'error': 'User not authenticated or not found'}), 404

        favorite = Favorite.query.filter_by(id=id, user_id=current_user.id).first()
        
        if not favorite:
            return jsonify({'error': f'Favorite with id {id} not found for the current user or you do not have permission to delete it'}), 404

        db.session.delete(favorite)
        db.session.commit()
        return jsonify({'message': f'Favorite with id {id} successfully deleted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_favorite: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred while trying to delete favorite with id {id}'}), 500
    

@api.route('/token', methods=['POST'])
def login_user():
    """
    payload:
    {
	    "email": "string",
	    "password": "string"
    }
    """
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

@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    payload:
    {
        "email" : "string"
    }
    """
    email = request.json.get('email')
    user = User.query.filter_by(email = email).first()
    if user:
        send_reset_email(user)
    else:
        return jsonify({"message": "Email provided is not in our records"}), 404
    return jsonify({"message": "If an account with that email exists, we have sent a password reset link"}), 200

@api.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    """
    payload:
    {
        "new_password" : "string"
    }
    """
    user = User.query.filter_by(reset_token = token).first()
    if user and user.verify_reset_token(token):
        new_password = request.json.get('new_password')
        user.reset_password(new_password)
        return jsonify({"message": "Your password has been updated"}), 200
    return jsonify({"message": "Invalid or expired token"}), 400

@api.route('/coin_suggestions/<query>', methods=['GET'])
def get_coin_suggestions(query):
    try:
        # Fetch coin suggestions from CoinGecko
        coingecko_url = f"{COINGECKO_API_URL}/search?query={query}"
        response = requests.get(coingecko_url)
        response.raise_for_status()
        
        coin_data = response.json()
        
        # Filter coins that start with the query string and include logos
        filtered_coins = [
            {
                'id': coin['id'],
                'name': coin['name'],
                'symbol': coin['symbol'],
                'logo': coin['large']  # Assuming 'large' has the URL for the logo
            } 
            for coin in coin_data['coins'] 
            if coin['name'].lower().startswith(query.lower())
        ]

        return jsonify({'coins': filtered_coins})
    except requests.RequestException as e:
        return jsonify({'error': f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/coin_news/<coin>', methods=['GET'])
def get_coin_news(coin):
    try:
        # Fetch the coin details from CoinGecko using the symbol
        coingecko_url = f"{COINGECKO_API_URL}/search?query={coin}"
        response = requests.get(coingecko_url)
        response.raise_for_status()
        
        coin_data = response.json()
        if not coin_data['coins']:
            return jsonify({'error': 'Coin not found'}), 404

        coin_name = coin_data['coins'][0]['name']

        # Fetch news from CryptoCompare
        cryptocompare_url = f"{CRYPTOCOMPARE_API_URL}?categories={coin_name}&api_key={CRYPTOCOMPARE_API_KEY}"
        response = requests.get(cryptocompare_url)
        response.raise_for_status()
        
        news_data = response.json()

        # Extract relevant data 
        articles = []
        for article in news_data.get('Data', []):
            articles.append({
                'id': article['id'],
                'title': article['title'],
                'source_info': article['source_info'],
                'published_on': article['published_on'],
                'imageurl': article.get('imageurl'),
                'url': article['url'],
                'body': article.get('body')  
            })

        return jsonify({'articles': articles})
    except requests.RequestException as e:
        return jsonify({'error': f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/coin_logos/<coin_symbol>', methods=['GET'])
def get_coin_logos(coin_symbol):
    try:
        coingecko_url = f"{COINGECKO_API_URL}/coins/markets"
        params = {
            'vs_currency': 'usd',
            'ids': coin_symbol
        }
        response = requests.get(coingecko_url, params=params)
        response.raise_for_status()
        
        coin_data = response.json()
        if not coin_data or 'image' not in coin_data[0]:
            return jsonify({'error': 'Logo not available'}), 404
        
        logo_url = coin_data[0]['image']
        return jsonify({'logo': logo_url})
    except requests.RequestException as e:
        return jsonify({'error': f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/convert/<from_coin_symbol>/<to_currency>', methods=['GET'])
def get_conversion_rate(from_coin_symbol, to_currency):
    try:
        coingecko_url = f"{COINGECKO_API_URL}/simple/price?ids={from_coin_symbol}&vs_currencies={to_currency}"
        response = requests.get(coingecko_url)
        response.raise_for_status()
        
        price_data = response.json()
        if from_coin_symbol in price_data and to_currency in price_data[from_coin_symbol]:
            rate = price_data[from_coin_symbol][to_currency]
            return jsonify({'rate': rate})
        else:
            return jsonify({'error': 'Conversion rate not available'}), 404
    except requests.RequestException as e:
        return jsonify({'error': f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
