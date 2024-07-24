import os
from dotenv import load_dotenv
from flask import (Flask, jsonify, send_from_directory, url_for)
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from backend.models import db

load_dotenv()

static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), './public/')

app = Flask(__name__,static_url_path='',static_folder='./public')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    "DATABASE_URI", 'sqlite:///app.db')

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASS')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('EMAIL_USER')
app.config['FRONTEND_URL'] = os.environ.get('FRONTEND_URL', 'https://your-frontend-url.com')

db.init_app(app)
migrate = Migrate(app, db)
cors = CORS(app)
jwt = JWTManager(app)
mail = Mail(app)

from backend.admin import setup_admin
from backend.commands import setup_commands
from backend.routes import api
from backend.models import User

# Register a callback function that takes whatever object is passed in as the
# identity when creating JWTs and converts it to a JSON serializable format.
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.email

# Register a callback function that loads a user from your database whenever
# a protected route is accessed. This should return any python object on a
# successful lookup, or None if the lookup failed for any reason (for example
# if the user has been deleted from the database).
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(email=identity).first()

setup_admin(app)
setup_commands(app)

app.register_blueprint(api)
app.config["JWT_SECRET_KEY"] = "1234test134"

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" +
                         y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"

@app.route('/', defaults={"filepath": ""})
@app.route('/<path:filepath>')
def sitemap(filepath):
    if app.debug:
        return generate_sitemap(app)
    if not os.path.isfile(os.path.join("./public", filepath)):
        return send_from_directory("./public", os.path.join(filepath, "index.html"))
    return send_from_directory("./public", filepath)

print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
print(f"MAIL_PASSWORD: {'*' * len(app.config['MAIL_PASSWORD']) if app.config['MAIL_PASSWORD'] else 'Not set'}")
