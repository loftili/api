FROM ubuntu:14.04
MAINTAINER Danny Hadley <danny@dadleyy.com>
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y vim build-essential
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y wget python2.7 tcl8.5
RUN mkdir -p /download
RUN ln -s /usr/bin/python2.7 /usr/bin/python

RUN (cd /download && wget http://nodejs.org/dist/v0.10.33/node-v0.10.33.tar.gz)
RUN (cd /download && tar xvzf node-v0.10.33.tar.gz)
RUN (cd /download/node-v0.10.33 && ./configure && make && make install)

RUN (cd /download && wget http://download.redis.io/redis-stable.tar.gz)
RUN (cd /download && tar xvzf redis-stable.tar.gz)
RUN (cd /download/redis-stable && make && make test && make install)
RUN (echo "daemonize yes" >> /etc/redis.conf)

RUN mkdir -p /app
COPY . /app
EXPOSE 80
CMD (/usr/local/bin/redis-server /etc/redis.conf && cd /app && /usr/local/bin/node app.js)
