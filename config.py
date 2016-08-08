import os

UPLOAD_FOLDER = '/home/edb/test_html_server/app/uploaded_imgs/img/'
UPLOAD_FOLDER2 = '/home/edb/test_html_server/app/uploaded_imgs/thumb/'

class Config(object):
    DEBUG = False

    MAIL_SERVER = ''
    MAIL_PORT = 587
    MAIL_USE_SSL = False
    SECRET_KEY= os.urandom(24)
    # change email information as needed
    MAIL_USE_TLS = True
    MAIL_USERNAME = ''
    MAIL_PASSWORD = ''
    DEFAULT_MAIL_SENDER = ''
    SECURITY_TOKEN_AUTHENTICATION_KEY = 'token'
    WTF_CSRF_ENABLED = False # apparently necessary for token auth
    
    MONGO_DBNAME = 'eye-learning-files'
    MONGODB_SETTINGS = {
    'db': 'eye-learning-files'
    }

    UPLOAD_FOLDER = UPLOAD_FOLDER
    UPLOAD_FOLDER2 = UPLOAD_FOLDER2
