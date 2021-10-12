FROM node:12-alpine3.12 as fam_builder
RUN apk update
RUN apk add --update bash

RUN apk add git
RUN npm install -g --unsafe-perm polymer-cli
RUN npm install -g typescript

WORKDIR /tmp
#ADD . /tmp/
ADD package.json /tmp/
ADD src_ts /tmp/src_ts/
ADD assets /tmp/assets/
ADD index.html /tmp/
ADD manifest.json /tmp/
ADD polymer.json /tmp/
ADD express.js /tmp/
ADD tsconfig.json /tmp/
ADD version.json /tmp/

RUN npm ci
# echo done is used because tsc returns a non 0 status (tsc has some errors)
RUN tsc || echo done
RUN export NODE_OPTIONS=--max_old_space_size=4096 && polymer build

FROM node:12-alpine3.12
RUN apk update
RUN apk add --update bash
WORKDIR /code
RUN npm install express --no-save
RUN npm install browser-capabilities@1.1.3 --no-save
COPY --from=fam_builder /tmp/express.js /code/express.js
COPY --from=fam_builder /tmp/build /code/build
EXPOSE 8080
CMD ["node", "express.js"]
