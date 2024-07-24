from flask_mail import Message
from flask import current_app, render_template, url_for
from main import mail, app
import logging

logging.basicConfig(level=logging.DEBUG)

def send_reset_email(user):
    token = user.generate_reset_token()
    frontend_url = current_app.config['FRONTEND_URL']
    reset_url = f"{frontend_url}/reset-password/{token}"
    
    try:
        msg = Message('Password Reset Request',
                      sender=current_app.config['MAIL_DEFAULT_SENDER'],
                      recipients=[user.email])
        msg.body = f'''To reset your password, visit the following link:
        {reset_url}

        If you did not make this request then simply ignore this email and no changes will be made.
        '''
        logging.debug(f"Attempting to send email to {user.email}")
        logging.debug(f"MAIL_SERVER: {current_app.config['MAIL_SERVER']}")
        logging.debug(f"MAIL_PORT: {current_app.config['MAIL_PORT']}")
        logging.debug(f"MAIL_USE_TLS: {current_app.config['MAIL_USE_TLS']}")
        logging.debug(f"MAIL_USERNAME: {current_app.config['MAIL_USERNAME']}")
        mail.send(msg)
        logging.debug("Email sent successfully")
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        logging.error(f"Error type: {type(e).__name__}")
        raise