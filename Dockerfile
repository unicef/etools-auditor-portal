FROM mhart/alpine-node:7
RUN apk update

RUN apk add git
RUN npm install -g bower gulp-cli


RUN mkdir /code/
ADD . /code/
RUN rm -rf /code/build/
RUN rm -rf /code/node_modules/
RUN rm -rf /code/src/bower_modules/
WORKDIR /code/

RUN npm install
RUN bower --allow-root install
RUN gulp build

EXPOSE 8080
CMD ["gulp", "start"]
