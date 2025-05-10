const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting tokens with the account:", deployer.address);

  // Get the token contract
  const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const Token = await hre.ethers.getContractFactory("TestToken");
  const token = Token.attach(tokenAddress);

  // Get user address from command line arguments or use a default
  const userAddress = process.argv[2] || deployer.address;
  console.log("Minting tokens to:", userAddress);

  // Mint 1000 tokens to the user
  const amount = hre.ethers.parseUnits("1000", 18);
  const tx = await token.transfer(userAddress, amount);
  await tx.wait();

  console.log(`Minted 1000 tokens to ${userAddress}`);
  
  // Check balance
  const balance = await token.balanceOf(userAddress);
  console.log(`New balance: ${hre.ethers.formatUnits(balance, 18)} tokens`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
