# Everest
Everest is an on-chain registry of crypto projects. It will be indexed as a subgraph on The Graph, and re-used across a variety of dApps and other subgraphs which need to reference projects data.

# Repo Structure
This monorepo contains:
* [`./contracts`](./contracts) - Everest Contracts  
* [`./subgraph`](./subgraph) - Everest Subgraph  
* [`./subgraph/mutations`](./subgraph/mutations) - Everest Mutations  
* [`./ui`](./ui) - Everest dApp

# Setup
Prerequisites:  
* `nvm`  
* `yarn`  
* **Docker Daemon Running!**

Run these commands from the root directory:  
* Install Dependencies  
  * `nvm install $(cat .nvmrc)`  
  * `nvm use $(cat .nvmrc)`  
  * `yarn`  

# Commands

This repository can be seen as having two ways of deploying and runningthe code - one that ties 
in everything to work with ropsten, and one with mainnet. The main commands  for each
network are:

```bash
yarn deploy-ropsten
yarn deploy-mainnet

yarn start:dev-ropsten
yarn start:dev-mainnet
```

Generally, you won't need to run any of the other node scripts.

`yarn deploy-ropsten` and `yarn deploy-mainnet` do the following:
  - Building the `./contracts` sub repository
  - Building the `./subgraph` sub repository
  - Building the `./subgraph/mutations` sub repository
  - Once all builds are successful, it will deploy the subgraph to the respective network on the hosted service for the graph

Normally the development of the subgraph and the front end can be done on their own. You
should deploy the subgraph to the hosted service, and then run the UI.

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