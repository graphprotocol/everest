# Everest

[Everest](everest.link) is a universally shared registry of crypto projects, built on [Ethereum](ethereum.org), [IPFS](ipfs.io) and [The Graph](thegraph.com). The Everest registry is a community-curated registry composed of projects and categories that make up the Web3 ecosystem. 

Everest’s mission is to catalyze the shift to Web3 by organizing all the projects that are working toward this common goal. Decentralization will create transparency and opportunity, enabling anyone in the world to contribute their talents to a global economy.

The Everest Registry will include any organization that believes in the goals of decentralization and the spirit of discovering and building radically new ways for humans to cooperate and organize. The registry uses the ERC-1056 identity standard for interoperability to allow project identities to be used across applications.

To contribute to the Everest registry, users can **add projects**, **challenge existing projects** and **vote on challenges** to curate the registry. **Project owners** can also edit project details at any time and **delegate voting** to other users.

Read the [Everest Charter](everest.link/charter) to learn more about project listing guidelines, registry curation, project challenges and community maintenance.

Everest is built on [The Graph](thegraph.com), an indexing and querying layer for efficient retrieval of blockchain data. The Everest subgraph captures project details using the ERC-1056 identity standard and can be queried by other dApps to integrate project data. The goal of Everest is to be a starting point for creating useful data on-chain, that can be referenced by other dApps via shared APIs. 

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

1. Create an `.env.development` file inside of the `ui` folder with the following content:

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

1. Create an `.env.development` file inside of the `ui` folder with the following content:

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

If you want to build Everest and run it in production mode (with contracts on Ropsten or Mainnet), rename the above `.env.development` file to `.env.production` (or duplicate it). From the root of the project, run:

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
in everything to work with Ropsten, and one with Mainnet. The main commands for each
network are:

```bash
yarn deploy-ropsten
yarn deploy-mainnet

yarn start:dev-ropsten
yarn start:dev-mainnet
```

Generally, you won't need to run any of the other node scripts.

You can also deploy the Everest subgraph from the root folder. Currently it is configured
to only work with the subgraph named `graphprotocol/everest`. If you are not a member
of graphprotocol on github, you will not be able to deploy the subgraph. Make sure to change the code to deploy to a subgraph under your own github name.

`yarn deploy-ropsten` and `yarn deploy-mainnet` do the following:

- Building the `./contracts` sub repository
- Building the `./subgraph` sub repository
- Building the `./subgraph/mutations` sub repository
- Once all builds are successful, it will deploy the subgraph to the respective network on the hosted service for the graph

Normally the development of the subgraph and the front-end can be done on their own.
You can run the UI independently, and decide whether it should use the Ropsten subgraph or contracts, or Mainnet. For local development, we want to use Ropsten.

To run the UI, use either `start:dev-ropsten` or `start:dev-mainnet`. These do the following

- Starts the UI at `localhost:4000` after a subgraph is already deployed to the hosted service. (They each take a different different `.env` file for each network

To deploy to an actual website, there is a setup with Docker and google cloud. This process depends

on the following two commands:

```bash
yarn build:mutations
yarn build:ui
```

# IMPORTANT - Notes on using Lerna for this monorepo

It is recommended for development to build all the sub repositories from the top level root folder with node scripts. Lerna allows for this, and is a smooth process. Only run node scripts from the sub modules if you are doing updates to core functionality and you know what you are doing.

If you want to build and edit the contracts, you should go directly into that sub repo and do it there, and run tests on ganache there. It is configured to work with a locally stored private key, which is a 12 word mneumonic.
