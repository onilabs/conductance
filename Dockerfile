FROM node:argon
MAINTAINER alex@onilabs.com

# install certbot (letsencrypt.org support) - see modules/services/https
RUN echo "deb http://ftp.debian.org/debian jessie-backports main" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get -t jessie-backports install -y --no-install-recommends certbot \
    && rm -rf /var/lib/apt/lists/*

# install conductance
RUN mkdir -p /usr/src/conductance
WORKDIR /usr/src/conductance
COPY . /usr/src/conductance
RUN make && ln -s /usr/src/conductance/conductance /usr/local/bin/conductance

VOLUME [ "/etc/letsencrypt" ]

ENTRYPOINT [ "conductance" ]
