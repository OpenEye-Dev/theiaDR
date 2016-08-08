# ML server program
from __future__ import division, print_function

import socket
import sys
import time

from datetime import datetime
from glob import glob

import re
import click
import numpy as np
import pandas as pd

import os
import sys
import socket
from flask import Flask, render_template,jsonify, request, redirect, url_for
from flask_limiter import Limiter
from werkzeug import secure_filename
from flask.ext.cors import CORS
np.random.seed(9)

# change to match computer (config?)
UPLOAD_FOLDER = '/home/edb/test_html_server/app/uploaded_imgs/'
ALLOWED_EXTENSIONS = set(['png','tiff','tif','jpg','jpeg','JPG','TIFF','TIF','PNG'])

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
#limiter = Limiter(app, global_limits=["20 per 1 second"])

def processImage(msg):
	return '[  0.00000]'

HOST = 'localhost'               # Symbolic name meaning all available interfaces
PORT = 50007              # Arbitrary non-privileged port
s = None
for res in socket.getaddrinfo(HOST, PORT, socket.AF_UNSPEC,
                              socket.SOCK_STREAM, 0, socket.AI_PASSIVE):
    af, socktype, proto, canonname, sa = res
    try:
        s = socket.socket(af, socktype, proto)
    except socket.error as msg:
        s = None
        continue
    try:
        s.bind(sa)
        s.listen(1)
    except socket.error as msg:
        s.close()
        s = None
        continue
    break
if s is None:
    print('could not open socket')
    sys.exit(1)
#conn, addr = s.accept()
while 1:
    conn, addr = s.accept()
    print('Connected by', addr)
    message = conn.recv(1024)
    if not data: break
    conn.send(processImage(message))
    conn.close()
