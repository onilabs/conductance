FROM node:10.15.3-stretch AS build
MAINTAINER alex@onilabs.com

# install conductance
RUN mkdir -p /usr/src/conductance
WORKDIR /usr/src/conductance
COPY . /usr/src/conductance
RUN make && ln -s /usr/src/conductance/conductance /usr/local/bin/conductance
# VOLUME [ "/etc/conductance/certs/" ]

FROM node:10.15-stretch-slim
# install certbot (letsencrypt.org support) - see modules/services/https
RUN apt-get update \
    && apt-get install -y --no-install-recommends python-ndg-httpsclient \
    && apt-get install -y --no-install-recommends certbot \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/conductance
COPY --from=build /usr/src/conductance/ /usr/src/conductance/
RUN ln -s /usr/src/conductance/conductance /usr/local/bin/conductance
ENTRYPOINT [ "conductance" ]