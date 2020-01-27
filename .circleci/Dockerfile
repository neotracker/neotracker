FROM node:10.16.3-alpine

ENV CLOUD_SDK_VERSION 207.0.0
ENV PATH /google-cloud-sdk/bin:$PATH

# Install gcloud
RUN apk --no-cache add \
  curl \
  python \
  py-crcmod \
  bash \
  libc6-compat \
  openssh-client \
  git \
  && curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
  tar xzf google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
  rm google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
  ln -s /lib /lib64 && \
  gcloud config set core/disable_usage_reporting true && \
  gcloud config set component_manager/disable_update_check true && \
  gcloud config set metrics/environment github_docker_image && \
  gcloud --version && \
  # Install kubectl and gcloud docker
  gcloud components install kubectl docker-credential-gcr --quiet && \
  # Install Docker
  apk --no-cache add docker && \
  # Setup circle user
  addgroup -g 3434 -S circleci && \
  adduser -u 3434 -G circleci -S circleci -s /bin/bash -D -h circleci && \
  # Install watchman
  apk add --no-cache --virtual .build-deps-watchman git build-base automake autoconf linux-headers libtool m4 openssl openssl-dev python python-dev && \
  git clone https://github.com/facebook/watchman.git /tmp/watchman-src && \
  cd /tmp/watchman-src && \
  git checkout v4.9.0 && \
  ./autogen.sh && \
  ./configure --enable-statedir=/tmp --without-pcre && \
  make && \
  make install && \
  apk del .build-deps-watchman && \
  rm -r /tmp/watchman-src && \
  # Add build dependencies
  apk add --no-cache \
  # node-gyp
  bash git openssh python python-dev make gcc g++ libc6-compat \
  # watchman
  linux-headers openssl openssl-dev

# Install up to date yarn
ENV YARN_VERSION 1.12.3

RUN apk add --no-cache --virtual .build-deps-yarn curl gnupg tar \
  && for key in \
  6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
  gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
  gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && rm /usr/local/bin/yarn \
  && rm /usr/local/bin/yarnpkg \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && apk del .build-deps-yarn
