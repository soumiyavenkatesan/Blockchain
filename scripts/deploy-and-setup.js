const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TestToken
  const Token = await hre.ethers.getContractFactory("TestToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // Deploy Vault
  const Vault = await hre.ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(tokenAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("Vault deployed to:", vaultAddress);

  // Deploy StrategyA
  const StrategyA = await hre.ethers.getContractFactory("StrategyA");
  const strategyA = await StrategyA.deploy(vaultAddress);
  await strategyA.waitForDeployment();
  const strategyAAddress = await strategyA.getAddress();
  console.log("StrategyA deployed to:", strategyAAddress);

  // Deploy StrategyB
  const StrategyB = await hre.ethers.getContractFactory("StrategyB");
  const strategyB = await StrategyB.deploy(vaultAddress);
  await strategyB.waitForDeployment();
  const strategyBAddress = await strategyB.getAddress();
  console.log("StrategyB deployed to:", strategyBAddress);

  // Add strategies to vault
  console.log("Adding strategies to vault...");
  await vault.addStrategy(strategyAAddress);
  await vault.addStrategy(strategyBAddress);
  console.log("Strategies added to vault");

  // Update frontend app.js with contract addresses
  console.log("Updating frontend with contract addresses...");
  const appJsPath = path.join(__dirname, '../frontend/app.js');
  let appJsContent = fs.readFileSync(appJsPath, 'utf8');

  // Replace placeholder addresses with actual addresses
  appJsContent = appJsContent.replace(
    'const vaultAddress = "YOUR_VAULT_CONTRACT_ADDRESS";',
    `const vaultAddress = "${vaultAddress}";`
  );

  appJsContent = appJsContent.replace(
    'const tokenAddress = "YOUR_TOKEN_CONTRACT_ADDRESS";',
    `const tokenAddress = "${tokenAddress}";`
  );

  // Read the ABI files
  const vaultAbiPath = path.join(__dirname, '../frontend/VaultABI.json');
  const tokenAbiPath = path.join(__dirname, '../frontend/TokenABI.json');

  const vaultAbiContent = fs.readFileSync(vaultAbiPath, 'utf8');
  const tokenAbiContent = fs.readFileSync(tokenAbiPath, 'utf8');

  // Replace placeholder ABIs with actual ABIs
  appJsContent = appJsContent.replace(
    /let vaultAbi = null;/,
    `let vaultAbi = ${vaultAbiContent};`
  );

  appJsContent = appJsContent.replace(
    /let tokenAbi = null;/,
    `let tokenAbi = ${tokenAbiContent};`
  );

  fs.writeFileSync(appJsPath, appJsContent);
  console.log("Frontend updated successfully");

  // Log summary
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Token:", tokenAddress);
  console.log("Vault:", vaultAddress);
  console.log("StrategyA:", strategyAAddress);
  console.log("StrategyB:", strategyBAddress);
  console.log("\nFrontend updated with contract addresses");
  console.log("-------------------");
  console.log("To interact with the contracts:");
  console.log("1. Run the frontend server: npm start");
  console.log("2. Open http://localhost:3000 in your browser");
  console.log("3. Connect your MetaMask wallet to the local Hardhat network");
  console.log("4. Make sure to import the deployer account into MetaMask to have test tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
