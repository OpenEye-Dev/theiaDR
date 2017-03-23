FROM tensorflow/tensorflow

RUN mkdir -p $HOME/src
RUN mkdir -p $HOME/model
WORKDIR $HOME/src
COPY labels.txt output_graph.pb /model/
COPY app.py wsgi.py /src/

RUN /usr/local/bin/pip install flask pillow gunicorn

EXPOSE 8080
CMD ["/usr/bin/python", "app.py"]
