#----------------------------------------------------------
# Module Imports
#----------------------------------------------------------

from __future__ import division, print_function
from datetime import datetime
from glob import glob
import numpy as np
import hashlib
from OpenSSL import SSL
import re

import os
import sys
import socket
import uuid as uuid_module
from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_limiter import Limiter
from functools import wraps
from flask import request, abort

from flask.ext.mail import Mail, Message
from flask.ext.mongoengine import *
from flask.ext.security import Security, MongoEngineUserDatastore, \
    UserMixin, RoleMixin
import flask.ext.security as flask_security
from flask import session

from werkzeug import secure_filename
from flask.ext.cors import CORS

import base64
import json
import cStringIO
from PIL import Image

import config

#----------------------------------------------------------
# Flask Configuration
#----------------------------------------------------------

np.random.seed(9)

app = Flask(__name__)
app.config.from_object(config.Config)   # external config.py

ANONYMOUS_ID = '0'
ALLOWED_EXTENSIONS = set(['png','tiff','tif','jpg','jpeg','JPG','TIFF','TIF','PNG'])

limiter = Limiter(app, global_limits=['5 per 1 second'])

db = MongoEngine(app)   # connect to db

mail = Mail(app)        # send confirmation emails

HOST = 'localhost'      # The remote host
PORT = 50007            # The same port as used by the server
s = None

# image serving is somewhat broken at the moment ^.^ due to not recognizing paths
#app.config['MEDIA_FOLDER'] = '/files/thumb/'

#@app.route('/home/edb/test_html_server/app/uploaded_imgs/thumb')
#def download_file(filename):
#    return send_from_directory(MEDIA_FOLDER, filename, as_attachment=True)

#----------------------------------------------------------
# Flask-Security and MongoEngine Setup
#----------------------------------------------------------
# Role schema, such as Admin, Editor, User, etc.
# Not currently implemented
class Role(db.Document, RoleMixin):
    name = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)

# Generic User schema
class User(db.Document, UserMixin):
    firstname = db.StringField(max_length=40)   # first name
    lastname = db.StringField(max_length=40)    # last name
    email = db.EmailField(max_length=100, unique=True)  # email (contact information)
    uid = db.StringField(max_length=40, unique=True)    # username, technically 4-12 char
    password = db.StringField(max_length=20)    # password, at least 1 number
    active = db.BooleanField(default=True)      # set False for user confirmation
    confirmed_at = db.DateTimeField()           # confirmation time, currently not used
    roles = db.ListField(db.ReferenceField(Role), default=[])

# Setup Flask-Security
user_datastore = MongoEngineUserDatastore(db, User, Role)
security = Security(app, user_datastore)

# Generic entry schema, per image uploaded
class Entry(db.Document):
    uid = db.StringField(max_length=40)         # uploader username
    uuid = db.StringField(max_length=255)       # image filename, uuid
    datetime = db.DateTimeField()               # time of upload
    diag = db.FloatField()                      # DR diagnosis of image

# API key schema
class Key(db.Document):
    key = db.StringField(max_length=255)        # API key, uuid
    uid = db.StringField(max_length=40)         # username of API key owner
    datetime = db.DateTimeField()               # time of API key creation

# User token schema
class Token(db.Document):
    token = db.StringField(max_length=255)      # flask-security user token
    uid = db.StringField(max_length=40)         # username
    last_login = db.DateTimeField()             # last login time

#----------------------------------------------------------
# API Key Implementation
#----------------------------------------------------------

# decorator wrapper for requiring an API key to view function
def require_appkey(view_function):
    @wraps(view_function)
    def decorated_function(*args, **kwargs):    # function to be decorated
        if check_appkey():                      # if API key is valid, allow view
            return view_function(*args, **kwargs)
        else:
            abort(401)                          # else shows "unauthorized"
    return decorated_function                   # function wrapped

# postcondition: a new API key is saved in db
# return: uuid that represents a valid API key
def create_key(uid):
    key = str(uuid_module.uuid4())
    time = str(datetime.utcnow())
    newKey = Key(key = key, uid = uid, datetime = time)
    newKey.save()
    return key

# checks_appkey verifies that the provided API key exists
# precondition: if API key provided, is a query string in URL
# return: true if API key valid, false otherwise
def check_appkey():
    if not request.args.get('key'):             # if no key provided, return False
        return False;
    appkey = unicode(request.args.get('key'))
    exist = Key.objects(key = appkey)           # look for key in db
    if exist == None:
        return False;                           # if key doesn't exist, False
    return True;                                # else, True

# precondition: key is a valid API key for the current db, checked beforehand
# postcondition: user whose API key is given is logged in by token
def login_by_key(key):
    entry = Key.objects.get(key = key)          # key entry
    uid = entry.uid
    user = User.objects.get(uid = unicode(uid)) # user entry
    token = user.get_auth_token()
    session['session_token'] = token            # insert token into session
    session['uid'] = uid                        # insert uid (to get later)
    save_token(id, token)                       # save last login time
    return redirect(url_for('index', token=token))

# send API key through email
# postcondition: email sent to -email-
def send_email(email, subject, template, **kwargs):
    msg = Message(
                  subject = subject,
                  recipients=[email],
                  html=render_template(template, **kwargs),
                  sender=app.config['DEFAULT_MAIL_SENDER']
                  )
    mail.send(msg)

#----------------------------------------------------------
# Image Manipulation Section
#----------------------------------------------------------

# separates file extension and checks if is an image file
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# b64: base64 encoded string
# return: decoded version of b64 with tag removed
def decodeB64(b64):
    str = b64.replace('data:image/png;base64,', '') #replace tag
    decoded = base64.b64decode(str)
    return decoded

def encodeB64(filepath):
    encoded = 'data:image/png;base64,'
    with open(filepath,"rb") as image_file:
         encoded = encoded+base64.b64encode(image_file.read()).decode()
    return encoded

# imgData: raw image data in string form
# return: PIL object containing the image, or None
def encodePIL(imgData):
    try:
        str = cStringIO.StringIO()              # PIL only accepts weird formats
        str.write(imgData)                      # so make it a cStringIO
        img = Image.open(str)                   # open Image by str data
        return img                              # a pickled image? how sour
    except:
        return None;

# uid: uid of uploader
# uuid: filename of image
# diag: diagnosis of image
# postcondition: an Entry containing the datetime, UID, and diagnosis
# of a given image is saved to collection 'entry'
# return: entryID, which is randomly assigned, will help connect file and data
def dbwrite(uid, uuid, diag):
    time = str(datetime.utcnow())
    entry = Entry(uid = uid, uuid = uuid, diag = 2, datetime = time)
    entry.save()
    entry = Entry.objects.get(uuid = uuid)
    return str(entry.id)

# file: FileStorage object or PIL Image that as a save() function
# postcondition: img saved in UPLOAD_FOLDER as uuid.png
# return: fullpath to image file, and uuid (unique) filename for file
thumb_size = 128, 128
def saveImg(file):
    uuid = str(uuid_module.uuid4())             # 16 bit randomness
    filename = uuid + '.png'                    # image and thumbnail (preview)
    filename_thumb = uuid + '_thumb.png'
    
    fullpath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(fullpath)
    
    img = Image.open(fullpath)                  # convert to 128 max side
    img.thumbnail(thumb_size)
    
    img.save(os.path.join(app.config['UPLOAD_FOLDER2'], filename_thumb))
    return (fullpath,filename[:-4])             # delete .png

# filepath: full path string to image file machine learning algorithm will analyze
# s: socket connection to machine learning algorithm
# data: string of estimate 0-4 for image grade
# return: response from machine learning algorithm over socket connection
def getDiagRequest(filepath):
    for res in socket.getaddrinfo(HOST, PORT, socket.AF_UNSPEC, socket.SOCK_STREAM):
        af, socktype, proto, canonname, sa = res
        try:
            s = socket.socket(af, socktype, proto)
        except socket.error as msg:
            s = None
            continue
        try:
            s.connect(sa)
        except socket.error as msg:
            s.close()
            s = None
            continue
        break
    if s is None:
        print('could not open socket')
        return "' Err!'"
    s.sendall(filepath)
    data = s.recv(1024)
    s.close()
    return repr(data)

# file: image file sent by client
# uid: user ID of the current user
# postcondition: data regarding the image has been saved to mongoDB,
# and image file has been saved to an upload folder locally
# return: diagnosis of the given image file, and entryID in db
def processImage(file, uid):
    # file is either filestorage (verified as valid image) or img
    fullpath,uuid = saveImg(file)
    # blocking socket connection to NN interface [PORT?
    diag = getDiagRequest(fullpath)
    #save image, uid, diagnosis, date to a database
    entryID = dbwrite(uid, uuid, diag)
    return (diag,entryID)

#----------------------------------------------------
# Upload Image Section
#----------------------------------------------------

# sends swagger ui rendered page from dist/swagger.json documentation
@app.route('/docs')
def docs():
    return app.send_static_file('dist/index.html')

# gets image data from client and processes it
# postcondition: if proper image, with valid credentials, image and
# thumbnail are saved in folder and entry with information (including
# diagnosis) is saved in db
# return: json of diag, uid, and entryid to the client
@app.route('/api/v1/uploadImage', methods=['POST'])
def uploadImage():
    diag = '-Err1'                          # bad upload placeholders
    entryID = 'BAD API TOKEN REQUEST'
    uid = 'BAD API TOKEN REQUEST'
    verified = True
    if not token_logged_in():               # if no login, check API key
        if not check_appkey():              # no API key, no access
            verified = False
    if verified:
        print(request.files)
        try:
            uid = session['uid']                    # since token auth
	except:
	    print('session uid grab failed')
	    uid = 'test_session_dne'
	print(session)
        file = request.files['file']                # titled 'file' in .js
        print(file)
        if file and allowed_file(file.filename):
            diag,entryID = processImage(file, uid)
    return jsonify(grade=diag[1:-1],uid=uid,database_id=entryID)

# gets b64 image data from client and processes it
# postcondition: if proper image, with valid credentials, image and
# thumbnail are saved in folder and entry with information (including
# diagnosis) is saved in db
# return: json of diag, uid, and entryid to the client
@app.route('/api/v1/uploadImageB64', methods=['POST'])
def uploadImageB64():
    if not token_logged_in():               # if no login, check API key
        if not check_appkey():              # no API key, no access
            return jsonify(grade=0,uid=ANONYMOUS_ID,database_id=0)

    file = request.form['file']                 # titled 'file' in .js
    filename = request.form['filename']     # separated since b64
    uid = session['uid']                    # since token auth
    diag = '-Err1'                          # bad upload placeholders
    entryID = '-Err1'
    if file and allowed_file(filename):
        filename = secure_filename(filename)#werkzeug thing
        file = decodeB64(file)              # convert b64 str to PIL Image
        img = encodePIL(file)
        diag,entryID = processImage(img, uid)
    return jsonify(grade=diag[1:-1],uid=uid,database_id=entryID)

#----------------------------------------------------
# User Account Section
#----------------------------------------------------

# signs user up, given valid credentials and no repeat
# of username
# postcondition: new user signed up, given and emailed API key
# if any error, doesn't sign user up (prints in console for now)
@app.route('/api/v1/signup', methods=['POST'])
def signup():

    # return render_template('home.html')
    uid = request.form['uid']
    pw = request.form['password']
    email = request.form['email']
    firstname = request.form['firstname']
    lastname = request.form['lastname']
    
    try:
        user = User.objects.get(uid = unicode(uid)) # if user exists, no good
        print("Sorry, that username is taken!")
    except mongoengine.DoesNotExist:                # if username not taken, email
        try:
            user = User.objects.get(email = unicode(email))
            print("Sorry, that email is taken! Did you forget your password?")
        except:                                         # else okay to sign up
            user_datastore.create_user(
                uid = uid,
                password = pw,
                email = email,
                firstname = firstname,
                lastname = lastname)
    except:
        return render_template('home.html')         # if multiple users, something messed up
    return render_template('home.html')             # else everything okay!

    key = create_key(uid)                           # give them API key
    send_email(
               email,
               'Welcome to Theia',
               './security/email/welcome.html',
               firstname = firstname,
               username = uid,
               # adjust to actual link later
               confirm_url = 'https://0.0.0.0:5001/?key=' + key)
    return render_template('home.html')

# postcndition: saves the authentication token of user by uid and
# stores time of last (this) login
def save_token(uid, token):
    time = str(datetime.utcnow())                   # time of last login
    uid = str(uid)                                  # user who logged in
    newToken = Token(token = token, uid = uid, last_login = time)
    newToken.save()                                 # "Token" is a token entry
    return token

# function wrapper for @auth_token_required decorator
# checks if token is in session; if so, allow access; else, no access
def auth_token_required(func):
    @wraps(func)
    def check_token(*args, **kwargs):
        if not token_logged_in(): # session = user session
            # If it isn't redirect to log in page
            return render_template('./security/login_user.html',message="Please log in to view this page.")
        # Otherwise just send them where they wanted to go
        return func(*args, **kwargs)
    return check_token

# boolean checker for logged in by token
# return: true if token in user session; false otherwise
def token_logged_in():
    if 'session_token' not in session:
        return False
    return True

# precondition: a user is logged in and has uid in session
# returns name of current user
def get_name():
    uid = session['uid']
    user = User.objects.get(uid = uid)
    return user.firstname

# allow client to know whether or not the user is logged in with token
app.jinja_env.globals.update(token_logged_in = token_logged_in)
# display user's name
app.jinja_env.globals.update(get_name = get_name)

# signs user in, given valid credentials
# postcondition: if valid credentials, session has a token and
# uid inside; else, user is redirected back to the login page and told
# that their credentials are wrong
@app.route('/api/v1/signin', methods=['POST','GET'])
def signin():
    user_id = request.form['uid']
    pw = request.form['password']
    try:                                        # if user exists, sign in user with token
        user = User.objects.get(uid = unicode(user_id))
        token = user.get_auth_token()           # flask-security auth token
        if flask_security.utils.verify_and_update_password(pw, user):
            session['session_token'] = token    # put token in the session
            session['uid'] = user_id            # put uid in session for access
            save_token(id, token)               # every login is saved with the login time
            return redirect(url_for('index', token=token))
        else:
            message = "You have entered a wrong username or password. Please try again."
    except:
        message="You have entered a wrong username or password. Please try again."
    return render_template('./security/login_user.html', message=message)

# precondition: user must be logged in (to be logged out)
# postcondition: user logged out by removing access token from session
@app.route('/api/v1/logout')
@auth_token_required
def logout():
    session.pop('session_token', None)
    return redirect(url_for('index'))

# locate all the thumbnails uploaded by the user
# since images is a login-required page, won't worry
# about guest users
# return: times of image upload, diagnoses of images, and filepaths
def findUserImgs(uid):
    entries = Entry.objects(uid = unicode(uid)).as_pymongo()
    uuids = []
    datetime = []
    diag = []
    
    for entry in entries:
        uuid = str(entry['uuid'])           # find all filenames of images
        # Check if filenmae exists and clear out in database if not?
        uuids.append(str(uuid))
        datetime.append(entry['datetime'])  # times of upload
        diag.append(entry['diag'])          # diagnoses
    
    b64imgs = []
    for uuid in uuids:
        # for some reason, won't load these
        filename = app.config['UPLOAD_FOLDER2'] + uuid + '_thumb.png'
        b64img = encodeB64(filename)
        b64imgs.append(b64img)          # specify filepath (change for computer)
    return datetime, diag, b64imgs      # received by client

# login page
@app.route('/api/v1/login')
def login():
    return render_template('./security/login_user.html')

@app.route('/api/v1/getKey')
@auth_token_required
def getKey():
    token = 'NOT VALID'
    if token_logged_in():
        uid = session['uid']
        user = User.objects.get(uid = uid)
        token = user.get_auth_token() 
    return render_template('api_key.html',token=token)

# this route takes the user to the registration page
@app.route('/api/v1/register')
def register():
    # return home to disable registering for now
    # return render_template('home.html')
    return render_template('register.html')

# precondition: user is logged in, with uid in session
# return: data for page to display
@app.route('/api/v1/images', methods=['GET'])
@auth_token_required
def images():
    datetime, diag, imgs = findUserImgs(session['uid'])
    n = len(imgs)
    return render_template('images.html', imgs=imgs, datetime=datetime, diag=diag, n=n)

# index
@app.route('/', methods=['GET','POST'])
def index():
    if(check_appkey()):                     # if user comes through API link, log them in
        login_by_key(request.args.get('key'))
    if not token_logged_in():
        return render_template('./security/login_user.html',message="Please log in to view this page.")
    else:
        return render_template('home.html')

#----------------------------------------------------------
# Start Application with SSL
#----------------------------------------------------------
# change SSL certs and paths to match computer
if __name__ == '__main__':
    #context = ('./SSL/theia.crt','./SSL/theia.key')
    app.run(host='localhost', port=8080, debug=False)
