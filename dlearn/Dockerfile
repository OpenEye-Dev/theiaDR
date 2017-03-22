FROM tensorflow/tensorflow

RUN mkdir -p $HOME/src
WORKDIR $HOME/src
COPY labels.txt output_graph.pb app.py .

RUN /usr/local/bin/pip install flask pillow 

EXPOSE 8080
CMD ["/usr/bin/python", "app.py"]