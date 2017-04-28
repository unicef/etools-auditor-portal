FROM mhart/alpine-node:7
RUN apk update

RUN apk add git
RUN node -v
RUN npm install -g bower gulp-cli


RUN mkdir /code/
ADD . /code/
VOLUME /code/build/
VOLUME /code/node_modules/
VOLUME /code/src/bower_modules/
WORKDIR /code/

RUN node -v
RUN npm install
RUN bower --allow-root install
RUN node -v
RUN /code/node_modules/.bin/gulp build

EXPOSE 8080
CMD ["/code/node_modules/.bin/gulp", "start"]
