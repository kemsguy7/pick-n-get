console.clear()

import "dotenv/config";
import { ethers} from "ethers";
import fs from "fs";

const abi = fs.readFileSync("./build/Product.abi").toString();
const bytecode = fs.readFileSync("./build/Product.bin").toString();

const network = "testnet";
const explorerURL = `https://hashscan.io/${network}`;

const private_key = process.env.PRIVATE_KEY;
if (!private_key) {
  throw new Error("Please set PRIVATE_KEY in .env file");
}
const provider = new ethers.JsonRpcProvider(`https://${network}.hashio.io/api`);
const signer = new ethers.Wallet(private_key, provider);
const metadata = fs.readFileSync("./artifacts/contracts/Product.sol/Product.json", "utf8");
const source = fs.readFileSync("./contracts/Product.sol", "utf8");

async function main() {
    console.log("Deploying contract...");
    const pickngetContract = "0x2Caa291ceDF1c2b8AAA9053B1d3C496E3A5CF83A"
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(pickngetContract);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    const deployTxHash = deploymentTx ? deploymentTx.hash : undefined;

    console.log(`Product contract deployed at: ${contractAddress}`);
    console.log(`Product Deployment Tx Hash: ${deployTxHash ?? "N/A"}`);
    const body = {
      address: contractAddress,
    chain: "296", 
    files: {
      "metadata.json": metadata,
      "Product.sol": source
    },
    creatorTxHash: deployTxHash,
    chosenContract: "Product"
  };

    console.log(`Product Contract deployed to: ${contractAddress}\n`);
    console.log(`See product details in hashscan : \n ${explorerURL}/address/${contractAddress} \n`);

    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

