FROM node:10.15.3-stretch
MAINTAINER alex@onilabs.com

# install certbot (letsencrypt.org support) - see modules/services/https
RUN apt-get update \
    && apt-get install -y --no-install-recommends python-ndg-httpsclient \
    && apt-get install -y --no-install-recommends certbot \
    && rm -rf /var/lib/apt/lists/*

# install conductance
RUN mkdir -p /usr/src/conductance
WORKDIR /usr/src/conductance
COPY . /usr/src/conductance
RUN make && ln -s /usr/src/conductance/conductance /usr/local/bin/conductance

# VOLUME [ "/etc/conductance/certs/" ]

ENTRYPOINT [ "conductance" ]
