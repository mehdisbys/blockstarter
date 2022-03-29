# Blockstarter [![Build Status](https://app.travis-ci.com/mehdisbys/blockstarter.svg?branch=master)](https://app.travis-ci.com/mehdisbys/blockstarter)


![logo](./logo.png)


This project implements a Kickstarter-like application where people can list projects or causes that need funding and anyone can participate in their funding.

Requirements: 

- [x] Ability to list a project with a description + deadline + funding desired
    
- [x] Ability to send funds to a project :
    
- [x] it cannot be zero
    
- [x] it cannot exceed the funding amount
    
- [x] the project's deadline must be in the future

- [x] User can claim back donation if project fails to collect all funds needed
    
- [x] User can directly see which projects they contributed to

This project runs on the ethereum blockchain and uses: 

- Solidity
- Hardhat
- React
- Chai


The smart contract is tested and test results are available on Travis CI.

Example screenshots : 

![screen1](./screen1.png)
![screen1](./screen2.png)

### Installation

1. Install NPM packages
   ```sh
   npm install
   ```

2. Run the app
   ```sh
   npm run start

3. Go to http://localhost:3000/


### Redeploy smart contract 

If you ever need to modify the smart contract, you will also need to redeploy it using hardhat.

To deploy to Rinkeby network : 

```sh
npx hardhat run scripts/deploy.js --network rinkeby
```