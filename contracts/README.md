# Everest Contracts
The Everest contracts allow for any list of members to be curated on Ethereum by a list of members.
Everest is a DAO that allows any Ethereum account to apply as a member. Whitelisted members can
then challenge any member they believe is representing themselves incorrectly, and with a majority
vote they can be removed from the list. 

Everest is used specifically to curate a list of crypto projects. However, it is encouraged that
this code is forked, and used to curate any list. 

## Environment
This repository works with Node 12. Some important notes about the npm packages used:
- It is desired that ethers is used for all interactions with Ethereums api. One problem to note,
truffle uses `bn.js` as return values when interacting with contracts. It is therefore 
recommended to use `bn.js` in all BigNumber situations, and to avoid using ethers BigNumber 
type. 
- `openzeppelin-test-helpers` is used. It depends on web3, which we want to avoid, but so far it is
working fine
- `Chai` is a dependancy of `openzeppelin-test-helpers`
- `Truffle 5.1.18` is recommended (with the solidity compiler that comes with it), which is
  `solc-js 0.5.12`
- `Solium` is used for linting Solidity files. The `prettier solidity plugin` was tried, but it is
buggy, so we removed it from the project until it is stable
- `Prettier` and `eslint` are used for js files. Note you must put the files to lint in quotes for 
`prettier` to work with npm scripts
- `Husky` for pre-commit hooks
- Node past v8 has had trouble with scrypt, which was a web3 dependancy. Web3 might be past this,
but in general we want to avoid using web3 because of its instability. Ethers is the way to go.

## Creating abis
The `package.json` has a command `yarn abis` that will create the abis for the contract using
`solc`. However, the docker image must be downloaded first. The instructions for that are found
(here)[https://solidity.readthedocs.io/en/v0.6.1/installing-solidity.html#docker].

## Testing
1. Make sure Node 12 is installed (It might work with newer versions, but it is unconfirmed)
2. Make sure Truffle 5.1.8 is installed globally `yarn global add truffle@5.1.18`
3. Run `yarn` at project root directory
4. Start ganache with `ganache-cli -d -l 9900000 -i 9854`. Note - we use 9,900,000 because that 
   is what mainnet eth is doing today (Dec 2019)
5. Run `truffle deploy`
6. Truffle stores the contracts each time you deploy. So the easiest way to restart is to just
   restart ganache with `CRTL-C`, and then start it up again and run `truffle deploy`
 
## Current Contract Addresses
See `addresses.json` 

## Deploying to Ropsten
1. Deploy new contracts to Ropsten with `truffle deploy --network ropsten`. Truffle stores the 
addresses for networks, so if you are trying to re-deploy you may have to run 
`truffle deploy --reset --network ropsten`
2. Get the new contract addresses from the deployment. They are logged in the terminal output from
deploying. Put these contract addresses into `addresses.json`
