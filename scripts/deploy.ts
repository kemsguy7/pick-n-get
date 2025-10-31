console.clear()

import "dotenv/config";
import { ethers} from "ethers";
import fs from "fs";

const abi = fs.readFileSync("./build/PicknGet.abi").toString();
const bytecode = fs.readFileSync("./build/PicknGet.bin").toString();

const network = "testnet";
const explorerURL = `https://hashscan.io/${network}`;

const private_key = process.env.PRIVATE_KEY;
if (!private_key) {
  throw new Error("Please set PRIVATE_KEY in .env file");
}
const provider = new ethers.JsonRpcProvider(`https://${network}.hashio.io/api`);
const signer = new ethers.Wallet(private_key, provider);
const metadata = fs.readFileSync("./artifacts/contracts/PicknGet.sol/PicknGet.json", "utf8");
const source = fs.readFileSync("./contracts/PicknGet.sol", "utf8");

async function main() {
    console.log("Deploying contract...");
    const SUPER_ADMIN_ADDRESS="0x71d9edF4D3E671274852a992ab331A8f4775b3F9"
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(SUPER_ADMIN_ADDRESS);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    const deployTx = contract.deploymentTransaction();
    const deployTxHash = deployTx?.hash ?? "";

    console.log(`PicknGet Contract deployed at: ${contractAddress}`);
    console.log(`PicknGet Deployment Tx Hash: ${deployTxHash}`);
    const body = {
      address: contractAddress,
    chain: "296", 
    files: {
      "metadata.json": metadata,
      "PicknGet.sol": source
    },
    creatorTxHash: deployTxHash,
    chosenContract: "PicknGet"
  };

    console.log(`PicknGet Contract deployed to: ${contractAddress}\n`);
    console.log(`See picknGet details in hashscan : \n ${explorerURL}/address/${contractAddress} \n`);

    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

