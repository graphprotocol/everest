FROM ubuntu

# Disable all user interactivity during build
ENV DEBIAN_FRONTEND noninteractive

ARG GATSBY_IPFS_HTTP_URI
ARG GATSBY_NETWORK_CONNECTOR_URI
ARG GATSBY_INFURA_ID
ARG GATSBY_NETWORK_URI
ARG GATSBY_GRAPHQL_HTTP_URI
ARG GATSBY_CHAIN_ID

RUN apt update -y
RUN apt-get install -y software-properties-common git build-essential

# Install NPM and Yarn
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn lerna
RUN yarn global add ipfs-deploy

# Copy root files
WORKDIR /opt/everest
COPY . .

# Install dependencies; include dev dependencies
ENV NODE_ENV production
RUN yarn --pure-lockfile --non-interactive --production=false

# Build source
RUN yarn build:mutations
RUN yarn build:ui

COPY package.json .
COPY yarn.lock .
COPY lerna.json .

# Regenerate and publish the UI and project pages whenever necessary
WORKDIR /opt/everest/ui/
ENV PATH "${PATH}:/root/go/bin/"
CMD ["node", "build-projects"]
