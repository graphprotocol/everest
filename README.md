# Everest

[Everest](everest.link) is a universally shared registry of crypto projects, built on
[Ethereum](ethereum.org), [IPFS](ipfs.io), [The Graph](thegraph.com) and [3Box](3box.io). The
Everest registry is a community-curated registry composed of projects and categories that make up
the Web3 ecosystem. 

Everest’s mission is to catalyze the shift to Web3 by organizing all the projects that are working
toward this common goal. Decentralization will create transparency and opportunity, enabling
anyone in the world to contribute their talents to a global economy.

The Everest Registry will include any organization that believes in the goals of decentralization
and the spirit of discovering and building radically new ways for humans to cooperate and organize.
The registry uses the ERC-1056 identity standard for interoperability to allow project identities
to be used across applications.

To contribute to the Everest registry, users can **add projects**, **challenge existing projects**
and **vote on challenges** to curate the registry. **Project owners** can also edit project details
at any time and **delegate voting** to other users.

Read the [Everest Charter](everest.link/charter) to learn more about project listing guidelines,
registry curation, project challenges and community maintenance.

Everest is built on [The Graph](thegraph.com), an indexing and querying layer for efficient
retrieval of blockchain data. The Everest subgraph captures project details using the ERC-1056
identity standard and can be queried by other dApps to integrate project data. The goal of Everest
is to be a starting point for creating useful data on-chain, that can be referenced by other dApps
via shared APIs. 

# Interacting with Everest and the path for full decentralization
Currently Everest is controlled by the team at The Graph. When someone applies to add a project,
or when they challenge, they must deposit real DAI. The first time you interact with Everest, it
will ask you to sign a message - which calls `permit()` on the DAI contract. This allows Everest
to transfer your DAI by having an unlimited allowance.

It should also be noted, the owner of the contracts is an address that The Graph is in control of.
This was done for the V1, and it is a point of centralization. At any time the funds within Everest
can be withdrawn by the team.

The team intends to launch a fully decentralized version in the future, where the funds can be 
spent to further the development of Everest. For now the team is leaving the funds in Everest, 
and will not take it out.

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

#### Run Everest UI locally with contracts already deployed to Ropsten

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


#### Run Everest locally with contracts already deployed to Ethereum Mainnet

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

If you want to build Everest and run it in production mode (with contracts on Ropsten or Mainnet), 
rename the above `.env.development` file to `.env.production` (or duplicate it). 
From the root of the project, run:

```
yarn build:mutations
yarn build:ui
```

After those builds finish, you can run

```
yarn serve
```

and access the UI in the browser at `http://localhost:9000`

# Deploying contracts
See the instructions in the README in the `./contracts` folder. 

# Deploying subgraphs
Deploying the subgraphs can be done from the root folder. You can also run the local UI, or use
production UI to see the new subgraph in action. To deploy a new subgraph, with local UI, run:

```bash
yarn deploy-subgraph-ropsten
yarn start:dev-ropsten
```
To deploy a new subgraph to mainnet, with local UI, run:

```bash
yarn deploy-subgraph-mainnet
yarn start:dev-mainnet
```

**Note - You must run these in the root folder**

Currently it is configured to only work with the subgraph named `graphprotocol/everest`. 
If you are not a member of graphprotocol on github, you will not be able to deploy the subgraph. 
Make sure to change the code to deploy to a subgraph under your own github name.

`yarn deploy-subgraph-ropsten` and `yarn deploy-subgraph-mainnet` do the following:
- Building the `./contracts` sub repository
- Building the `./subgraph` sub repository
- Building the `./subgraph/mutations` sub repository
- Once all builds are successful, it will deploy the subgraph to the respective network on the 
  hosted service for the graph (when the code is merged into master)

# Running the UI locally
Normally the development of the subgraph and the front-end can be done on their own.
You can run the UI independently, and decide whether it should use the Ropsten subgraph or 
contracts, or Mainnet. For local development, we want to use Ropsten.

To run the UI, use either `start:dev-ropsten` or `start:dev-mainnet`. These do the following:
- Starts the UI at `localhost:4000` after a subgraph is already deployed to the hosted service. 
  (They each take a different different `.env` file for each network.

To deploy to an actual website, there is a setup with Docker and google cloud. This process depends
on the following two commands:

```bash
yarn build:mutations
yarn build:ui
```

# Notes on using Lerna for this monorepo
It is recommended for development to build all the sub repositories from the top level root folder 
with node scripts. [Lerna](https://www.npmjs.com/package/lerna) allows for this, and is a smooth 
process. Only run node scripts in the contracts repository to deploy contracts.
