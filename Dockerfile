FROM ubuntu:14.04
MAINTAINER Danny Hadley <danny@dadleyy.com>
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y vim build-essential
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y wget python2.7
RUN mkdir -p /download
RUN ln -s /usr/bin/python2.7 /usr/bin/python
RUN (cd /download && wget http://nodejs.org/dist/v0.10.33/node-v0.10.33.tar.gz)
RUN (cd /download && tar xvzf node-v0.10.33.tar.gz)
RUN (cd /download/node-v0.10.33 && ./configure && make && make install)
RUN mkdir -p /app
COPY . /app
EXPOSE 80
