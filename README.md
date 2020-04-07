# Everest

Everest is an on-chain registry of crypto projects. It will be indexed as a subgraph on The Graph, and re-used across a variety of dApps and other subgraphs which need to reference projects data.

# Repo Structure

This monorepo contains:

- [`./contracts`](./contracts) - Everest Contracts
- [`./subgraph`](./subgraph) - Everest Subgraph
- [`./subgraph/mutations`](./subgraph/mutations) - Everest Mutations
- [`./ui`](./ui) - Everest dApp

# Setup

Prerequisites:

- `nvm`
- `yarn`

Run these commands from the root directory:

- Install Dependencies
  - `nvm install $(cat .nvmrc)`
  - `nvm use $(cat .nvmrc)`
  - `yarn`

# Quick start

#### Run Everest locally with contracts deployed to Ropsten

1. Create an `.env.development` file inside of the UI folder with the following content:

```
GATSBY_IPFS_HTTP_URI=https://api.thegraph.com/ipfs/api/v0/
GATSBY_NETWORK_CONNECTOR_URI=https://ropsten.infura.io/v3/[INFURA_ID]
GATSBY_INFURA_ID=[INFURA_ID]
GATSBY_NETWORK_URI=https://api.thegraph.com
GATSBY_GRAPHQL_HTTP_URI=https://api.thegraph.com/subgraphs/name/graphprotocol/everest-ropsten
GATSBY_CHAIN_ID=3
```

2. In the root of the project run:

```
yarn start:dev-ropsten
```

This will build mutations, and bring up the UI on port `4000`.

3. In your browser, go to `http://localhost:4000`

#### Run Everest locally with contracts deployed to Ethereum Mainnet

1. Create an `.env.development` file inside of the UI folder with the following content:

```
GATSBY_IPFS_HTTP_URI=https://api.thegraph.com/ipfs/api/v0/
GATSBY_NETWORK_CONNECTOR_URI=https://mainnet.infura.io/v3/[INFURA_ID]
GATSBY_INFURA_ID=[INFURA_ID]
GATSBY_NETWORK_URI=https://api.thegraph.com
GATSBY_GRAPHQL_HTTP_URI=https://api.thegraph.com/subgraphs/name/graphprotocol/everest
GATSBY_CHAIN_ID=1
```

2. In the root of the project run:

```
yarn start:dev-mainnet
```

This will build mutations, and bring up the UI on port `4000`.

3. In your browser, go to `http://localhost:4000`

#### Run Everest in production mode

If you want to build Everest and run in production mode (with contracts on Ropsten or Mainnet), rename the above `.env.development` file to `.env.production` (or duplicate it). The from the root of the project, run:

```
yarn build:mutations
yarn build:ui
```

After those builds finish, you can run

```
yarn serve
```

and access the UI in the browser at `http://localhost:9000`

# Commands

This repository can be seen as having two ways of deploying and running the code - one that ties
in everything to work with ropsten, and one with mainnet. The main commands for each
network are:

```bash
yarn deploy-ropsten
yarn deploy-mainnet

yarn start:dev-ropsten
yarn start:dev-mainnet
```

Generally, you won't need to run any of the other node scripts.

You can also deploy the everest subgraph from the root folder. Currently it is configured
to only work with the subgraph named `graphprotocol/everest`. If you are not a member
of graphprotocol on github, you can't deploy. You would have to change the code to deploy
to a subgraph under your own github name.

`yarn deploy-ropsten` and `yarn deploy-mainnet` do the following:

- Building the `./contracts` sub repository
- Building the `./subgraph` sub repository
- Building the `./subgraph/mutations` sub repository
- Once all builds are successful, it will deploy the subgraph to the respective network on the hosted service for the graph

Normally the development of the subgraph and the front end can be done on their own.
You can run UI independently, and decide whether it should use the ropsten subgraph or contracts, or mainnet. For local development, we want to use ropsten.

To run the UI, use either `start:dev-ropsten` or `start:dev-mainnet`. These do the following

- Starts the UI at `localhost:4000` after a subgraph is already deployed to the hosted service. (They each take a different different `.env` file for each network

To deploy to an actual website, there is a setup with Docker and google cloud. This process depends

on the following two commands:

```bash
yarn build:mutations
yarn build:ui
```

# IMPORTANT - Notes on using Lerna for this monorepo

You can build all the sub repositories from to top level root folder with node scripts. It is
recommended for development to do everything here. Lerna allows for this, and it is a smooth
process. Only run node scripts from the sub modules if you are doing updates to core functionality
and you know what you are doing.

If you want to build and edit the contracts, you should go directly into that sub repo and do it
and there, and run tests on ganache there. It is configured to work with a locally stored private
key, which is a 12 word mneumonic.
