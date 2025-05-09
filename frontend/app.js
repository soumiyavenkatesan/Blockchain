// Replace these with your deployed contract addresses
const vaultAddress = "YOUR_VAULT_CONTRACT_ADDRESS";
const tokenAddress = "YOUR_TOKEN_CONTRACT_ADDRESS";

// Replace with your actual ABI content (just a short version shown here for example)
const vaultAbi = [ /* paste Vault ABI here */ ];
const tokenAbi = [ /* paste Token ABI here */ ];

let provider;
let signer;
let vault;
let token;
let userAddress;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    vault = new ethers.Contract(vaultAddress, vaultAbi, signer);
    token = new ethers.Contract(tokenAddress, tokenAbi, signer);

    document.getElementById("status").innerText = `Connected: ${userAddress}`;
  } else {
    alert("Please install MetaMask");
  }
}

async function deposit() {
  const amount = document.getElementById("amount").value;
  if (!amount) return alert("Enter an amount");

  const amountInWei = ethers.parseUnits(amount, 18);

  try {
    // Approve Vault to spend user's token
    const approveTx = await token.approve(vaultAddress, amountInWei);
    await approveTx.wait();

    // Deposit to vault
    const tx = await vault.deposit(amountInWei);
    await tx.wait();

    document.getElementById("status").innerText = `Deposited ${amount} tokens`;
  } catch (err) {
    console.error(err);
    alert("Transaction failed");
  }
}

async function withdraw() {
  try {
    const tx = await vault.withdraw();
    await tx.wait();
    document.getElementById("status").innerText = "Withdraw successful";
  } catch (err) {
    console.error(err);
    alert("Withdraw failed");
  }
}
