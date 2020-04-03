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

This repository can be seen as having two ways of deploying the code - one that ties in everything
to work with ropsten, and one with mainnet. The two main commands are:

```bash
yarn start:dev-ropsten
yarn start:dev-mainnet
```

Those two commands do the following:
  - Building the `./contracts` sub repository
  - Building the `./subgraph` sub repository
  - Building the `./subgraph/mutations` sub repository
  - Deploying the subgraph to the respective network on the hosted service for the graph
  - Starting the UI based on all of the above. The UI takes a different `.env` file for each network
  - Note the command should be specifically ran in this order, as many of the sub repositories
    depend on each other.

Once you run these commands, you get the following setup:
- The subgraph is deployed to the hosted service with the latest contracts and subgraph and mutations
- The UI is running at localhost:4000, where you can do testing on ropsten, or interact with the
  real contracts on mainnet

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