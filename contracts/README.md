# Everest Contracts
The Everest contracts allow for any list of members to be curated on Ethereum by a list of members.
Everest is a DAO that allows any Ethereum account to apply as a member. Whitelisted members can
then challenge any member they believe is representing themselves incorrectly, and with a majority
vote they can be removed from the list. 

Everest is used specifically to curate a list of crypto projects. However, it is encouraged that
this code is forked, and used to curate any list. 

## Creating abis
The `package.json` has a command `yarn abis` that will create the abis for the contract using `solc`
. However, the docker image must be downloaded first. The instructions for that are found 
(here)[https://solidity.readthedocs.io/en/v0.6.1/installing-solidity.html#docker]. 
You must also update the local path of the contracts folder.

## Testing
1. Make sure Node 12 is installed (It might work with newer versions, but it is unconfirmed)
2. Make sure Truffle 5.1.8 is installed globally `yarn global add truffle@5.1.18`
3. Run `yarn` at project root directory
4. Start ganache with `ganache-cli -d -l 9900000 -i 9545`. Note - we use 9,900,000 because
   that is what mainnet eth is doing today (Dec 2019)
5. Run `truffle deploy`
6. Truffle stores the contracts each time you deploy. So the easiest way to restart is to just
   restart ganache with `CRTL-C`, and then start it up again and run `truffle deploy`

## Current Contract Addresses
See `addresses.json`

## Deploying to Ropsten
1. Deploy new contracts to Ropsten with `truffle deploy --network ropsten`. Truffle stores the 
   addresses for networks, so if you are trying to re-deploy you may have to 
   run `truffle deploy --reset --network ropsten`
2. Get the new contract addresses from the deployment. They are logged in the te
3. rminal output from deploying. Put these contract addresses into `addresses.json`
