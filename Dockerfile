FROM node:argon
MAINTAINER alex@onilabs.com
RUN mkdir -p /usr/src/conductance
WORKDIR /usr/src/conductance
COPY . /usr/src/conductance
RUN make && ln -s /usr/src/conductance/conductance /usr/local/bin/conductance
CMD [ "conductance" ]