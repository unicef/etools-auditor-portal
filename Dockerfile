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

# dirty hack to switch wct config while --configFile is unavailable
# latest release 5.0.1 doesn't allow it yet
# https://github.com/Polymer/web-component-tester/pull/388/
RUN rm wct.conf.js
RUN mv docker.wct.conf.js wct.conf.js

RUN npm install
RUN bower --allow-root install
RUN gulp build

EXPOSE 8080
CMD ["gulp", "start"]
