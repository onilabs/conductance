# 2 stage build because of rocksdb - needs a working node-gyp environment
FROM node:16.15.0-bullseye AS build
MAINTAINER alex@onilabs.com

# install conductance
RUN mkdir -p /usr/src/conductance
WORKDIR /usr/src/conductance
COPY . /usr/src/conductance
RUN ./src/build/make-conductance
RUN ln -s /usr/src/conductance/conductance /usr/local/bin/conductance

FROM node:16.15.0-bullseye-slim

# install certbot (letsencrypt.org support) - see modules/services/https
RUN apt-get update \
    && apt-get install -y --no-install-recommends certbot \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/conductance
COPY --from=build /usr/src/conductance /usr/src/conductance/
RUN ln -s /usr/src/conductance/conductance /usr/local/bin/conductance
ENTRYPOINT [ "conductance" ]
