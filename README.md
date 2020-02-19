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
* `docker-compose`  
* **Docker Daemon Running!**

Run these commands from the root directory:  
* Install Dependencies  
  * `nvm install $(cat .nvmrc)`  
  * `nvm use $(cat .nvmrc)`  
  * `yarn`  
* Build  
  * `yarn build`  
* Start  
  * `yarn start`  
  * Wait for everything to start & deploy...
  * Visit `http://localhost:4000`

If you'd like to completely reset your local environment, run `yarn reset:env`.  