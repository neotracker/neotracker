# neotracker/neo-one-circleci-node:10.16.3-1
FROM neotracker/neo-one-circleci-node@sha256:0f047d3662ad72b75e9550e41b22a2be0bf7fa8ee6563b65272b5af966b07f20 AS builder
# Install watchman for build layer
RUN sudo apt-get update && \
  sudo apt-get install build-essential python-dev automake autoconf libtool libssl-dev && \
  cd /tmp && \
  git clone https://github.com/facebook/watchman.git && \
  cd watchman && \
  git checkout v4.9.0 && \
  ./autogen.sh && \
  ./configure --enable-statedir=/tmp --enable-lenient && \
  sudo make && \
  sudo make install && \
  sudo mv watchman /usr/local/bin/watchman

RUN mkdir -p /tmp/neotracker
WORKDIR /tmp/neotracker
COPY package.json tsconfig.json tsconfig.static.json lerna.json yarn.lock babel.config.js LICENSE README.md ./
COPY tsconfig/ tsconfig
COPY @types/ @types
COPY root/ root
COPY public/ public
COPY packages/neotracker-build/src/ packages/neotracker-build/src
COPY packages/neotracker-build/package.json packages/neotracker-build/
COPY packages/neotracker-build/tsconfig.json packages/neotracker-build/
COPY packages/neotracker-client-web/src/ packages/neotracker-client-web/src
COPY packages/neotracker-client-web/package.json packages/neotracker-client-web/
COPY packages/neotracker-client-web/tsconfig.json packages/neotracker-client-web/
COPY packages/neotracker-client-web-next/src/ packages/neotracker-client-web-next/src
COPY packages/neotracker-client-web-next/package.json packages/neotracker-client-web-next/
COPY packages/neotracker-client-web-next/tsconfig.json packages/neotracker-client-web-next/
COPY packages/neotracker-component-explorer/src/ packages/neotracker-component-explorer/src
COPY packages/neotracker-component-explorer/package.json packages/neotracker-component-explorer/
COPY packages/neotracker-component-explorer/tsconfig.json packages/neotracker-component-explorer/
COPY packages/neotracker-core/src/ packages/neotracker-core/src
COPY packages/neotracker-core/package.json packages/neotracker-core/
COPY packages/neotracker-core/tsconfig.json packages/neotracker-core/
COPY packages/neotracker-logger/src/ packages/neotracker-logger/src
COPY packages/neotracker-logger/package.json packages/neotracker-logger/
COPY packages/neotracker-logger/tsconfig.json packages/neotracker-logger/
COPY packages/neotracker-server-db/src/ packages/neotracker-server-db/src
COPY packages/neotracker-server-db/package.json packages/neotracker-server-db/
COPY packages/neotracker-server-db/tsconfig.json packages/neotracker-server-db/
COPY packages/neotracker-server-graphql/src/ packages/neotracker-server-graphql/src
COPY packages/neotracker-server-graphql/package.json packages/neotracker-server-graphql/
COPY packages/neotracker-server-graphql/tsconfig.json packages/neotracker-server-graphql/
COPY packages/neotracker-server-scrape/src/ packages/neotracker-server-scrape/src
COPY packages/neotracker-server-scrape/package.json packages/neotracker-server-scrape/
COPY packages/neotracker-server-scrape/tsconfig.json packages/neotracker-server-scrape/
COPY packages/neotracker-server-utils/src/ packages/neotracker-server-utils/src
COPY packages/neotracker-server-utils/package.json packages/neotracker-server-utils/
COPY packages/neotracker-server-utils/tsconfig.json packages/neotracker-server-utils/
COPY packages/neotracker-server-utils-koa/src/ packages/neotracker-server-utils-koa/src
COPY packages/neotracker-server-utils-koa/package.json packages/neotracker-server-utils-koa/
COPY packages/neotracker-server-utils-koa/tsconfig.json packages/neotracker-server-utils-koa/
COPY packages/neotracker-server-web/src/ packages/neotracker-server-web/src
COPY packages/neotracker-server-web/package.json packages/neotracker-server-web/
COPY packages/neotracker-server-web/tsconfig.json packages/neotracker-server-web/
COPY packages/neotracker-server-test/src/ packages/neotracker-server-test/src
COPY packages/neotracker-server-test/package.json packages/neotracker-server-test/
COPY packages/neotracker-server-test/tsconfig.json packages/neotracker-server-test/
COPY packages/neotracker-shared-graphql/src/ packages/neotracker-shared-graphql/src
COPY packages/neotracker-shared-graphql/package.json packages/neotracker-shared-graphql/
COPY packages/neotracker-shared-graphql/tsconfig.json packages/neotracker-shared-graphql/
COPY packages/neotracker-shared-utils/src/ packages/neotracker-shared-utils/src
COPY packages/neotracker-shared-utils/package.json packages/neotracker-shared-utils/
COPY packages/neotracker-shared-utils/tsconfig.json packages/neotracker-shared-utils/
COPY packages/neotracker-shared-web/src/ packages/neotracker-shared-web/src
COPY packages/neotracker-shared-web/package.json packages/neotracker-shared-web/
COPY packages/neotracker-shared-web-next/src/ packages/neotracker-shared-web-next/src
COPY packages/neotracker-shared-web-next/package.json packages/neotracker-shared-web-next/
COPY packages/neotracker-shared-web-next/tsconfig.json packages/neotracker-shared-web-next/

RUN sudo yarn install
RUN sudo npm i -g cross-env
RUN sudo yarn build-core

FROM node@sha256:f35820f56323a0ae30406651fdc2f0525f4719e187a5b7f2f35a1dcd77f2495f AS production
RUN mkdir -p neotracker-core
COPY --from=builder tmp/neotracker/dist/neotracker-core/ neotracker-core/
COPY yarn.lock neotracker-core/
WORKDIR /neotracker-core
RUN yarn install --production
ENTRYPOINT ["/usr/local/bin/node", "bin/neotracker", "neotracker"]
