# Yield Optimizer DApp

A decentralized application for optimizing yield across different strategies.

## Setup and Running

### Prerequisites
- Node.js and npm installed
- MetaMask browser extension

### Setup Instructions

1. Install dependencies:
```shell
npm install
```

2. Run the setup script (starts a local Hardhat node and deploys contracts):
```shell
npm run setup
```

3. Start the application:
```shell
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3001
```

5. Connect MetaMask to the local Hardhat network:
   - Network Name: Hardhat
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

6. Import a test account into MetaMask:
   - In the Hardhat node terminal, you'll see a list of accounts with private keys
   - Import the first account into MetaMask using its private key
   - This account has test tokens that you can use

### Usage

1. Connect your wallet using the "Connect Wallet" button
2. Enter an amount to deposit
3. Click "Deposit" to deposit tokens into the vault
4. Click "Withdraw All" to withdraw all your tokens from the vault

## Development

### Running a local node
```shell
npm run node
```

### Deploying contracts
```shell
npm run deploy
```
