FROM tensorflow/tensorflow

RUN mkdir -p $HOME/src
WORKDIR $HOME/src
COPY output_graph.pb .
COPY app.py .

RUN /usr/local/bin/pip install flask
RUN /usr/local/bin/pip install pillow 
EXPOSE 8080
CMD ["/usr/bin/python", "app.py"]
