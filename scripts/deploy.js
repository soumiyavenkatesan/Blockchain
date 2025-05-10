const hre = require("hardhat");

async function main() {
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

  // Add strategies to vault
  console.log("Adding strategies to vault...");
  await vault.addStrategy(strategyAAddress);
  await vault.addStrategy(strategyBAddress);
  console.log("Strategies added to vault");

  // Update frontend app.js with contract addresses
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Token:", tokenAddress);
  console.log("Vault:", vaultAddress);
  console.log("StrategyA:", strategyAAddress);
  console.log("StrategyB:", strategyBAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
