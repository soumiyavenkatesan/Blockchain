const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("TestToken");
  const token = await Token.deploy();
  await token.deployed();

  const Vault = await hre.ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(token.address);
  await vault.deployed();

  const StrategyA = await hre.ethers.getContractFactory("StrategyA");
  const strategyA = await StrategyA.deploy(vault.address);
  await strategyA.deployed();

  const StrategyB = await hre.ethers.getContractFactory("StrategyB");
  const strategyB = await StrategyB.deploy(vault.address);
  await strategyB.deployed();

  await vault.addStrategy(strategyA.address);
  await vault.addStrategy(strategyB.address);

  console.log("Vault deployed to:", vault.address);
  console.log("StrategyA deployed to:", strategyA.address);
  console.log("StrategyB deployed to:", strategyB.address);
  console.log("Token deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
