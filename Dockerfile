FROM ubuntu

ARG GATSBY_IPFS_HTTP_URI
ARG GATSBY_NETWORK_CONNECTOR_URI
ARG GATSBY_INFURA_ID
ARG GATSBY_NETWORK_URI
ARG GATSBY_GRAPHQL_HTTP_URI
ARG TEXTILE_TOKEN

RUN apt update -y
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:longsleep/golang-backports
RUN apt update -y
RUN apt install -y golang-go

# Install Textile
RUN apt-get install -y git
WORKDIR /opt
RUN git clone https://github.com/textileio/textile
WORKDIR /opt/textile
RUN go install github.com/textileio/textile/cmd/textile

# Install NPM and Yarn
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn lerna

# Copy root files
WORKDIR /opt/everest
COPY . .

# Inject Textile token
RUN echo "token: ${TEXTILE_TOKEN}" > ui/.textile/auth.yml

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
