import { ethers } from "ethers";
import abi from "./TestTokenABI.json"; // or paste directly as a JS variable

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contractAddress = "0xYourDeployedContractAddress"; // replace this
const contract = new ethers.Contract(contractAddress, abi, signer);

// Now you can call functions
const name = await contract.name();
console.log("Token name:", name);
