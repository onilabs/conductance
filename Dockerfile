FROM node:20.13-bookworm
MAINTAINER alex@onilabs.com

# install certbot (letsencrypt.org support) - see modules/services/https
RUN apt-get update \
    && apt-get install -y --no-install-recommends certbot \
    && rm -rf /var/lib/apt/lists/*

# install conductance
RUN mkdir -p /usr/src/conductance
WORKDIR /usr/src/conductance
COPY . /usr/src/conductance
RUN ./src/build/make-conductance
RUN ln -s /usr/src/conductance/conductance /usr/local/bin/conductance
ENTRYPOINT [ "conductance" ]
