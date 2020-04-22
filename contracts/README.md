# Everest Contracts
Everest is a DAO that allows any Ethereum account to apply as a member. Whitelisted members can
then challenge any member they believe is representing themselves incorrectly, and with a majority
vote they can be removed from the list. 

Everest is used specifically to curate a list of crypto projects. However, it is encouraged that
this code is forked, and used to curate any list. 

## Instructions
These instructions are specific to just deploying contracts. The root folder has more instructions
for deploying the whole dapp.

## Building Solidity and ABIs
Run `yarn build`
The `package.json` has a command `yarn build` that will run `truffle build`, run a script to 
extract the abis, and run a script to create flattened contracts.

## Linting
This project uses Prettier, Solium, and eslint. Node scripts are in `package.json`
to help.

## Testing
1. Make sure Node 12 is installed (It might work with newer versions, but it is unconfirmed)
2. Make sure Truffle is installed globally. It currently works with version `v5.0.43`. 
   The command is `yarn global add truffle`
3. Run `yarn` at contracts root directory
4. Start ganache with `ganache-cli -d -l 9900000 -i 9545`. Note - we use 9,900,000 because that is 
   what mainnet eth is doing today (Dec 2019)
5. Run `truffle test`
6. Truffle stores the contracts each time you deploy. So the easiest way to restart is to just
   restart ganache with `CRTL-C`, and then start it up again and run `truffle test`

## Current Contract Addresses
See `addresses.json`

## Deploying
1. Deploy new contracts to Ropsten with `yarn deploy-ropsten`. Mainnet is `yarn deploy-mainnet`.
2. Get the new contract addresses from the deployment. They are logged in the terminal
   output from deploying. Put these contract addresses into `addresses.json`
