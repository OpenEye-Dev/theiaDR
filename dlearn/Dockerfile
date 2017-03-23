FROM tensorflow/tensorflow

RUN mkdir -p /src
RUN mkdir -p /model
WORKDIR /src
COPY labels.txt output_graph.pb /model/
COPY app.py wsgi.py /src/

RUN /usr/local/bin/pip install flask pillow gunicorn

EXPOSE 8080
CMD ["/usr/local/bin/gunicorn", "--workers", "3", "--bind", "0.0.0.0:8080", "wsgi"]
