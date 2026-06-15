import hre from "hardhat";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const MedicalHistoryLedger = await hre.ethers.getContractFactory("MedicalHistoryLedger");
  const contract = await MedicalHistoryLedger.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("MedicalHistoryLedger deployed to:", address);

  // Deployer is owner + authorized writer by constructor. If the backend signs
  // with a different account, authorize it here via env var.
  const backendWriter = process.env.BACKEND_WRITER_ADDRESS;
  if (backendWriter && backendWriter.toLowerCase() !== deployer.address.toLowerCase()) {
    const tx = await contract.authorizeWriter(backendWriter);
    await tx.wait();
    console.log("Authorized backend writer:", backendWriter);
  }

  const deployInfo = {
    contractAddress: address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    abi: JSON.parse(contract.interface.formatJson()),
  };

  const outPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));
  console.log("Deployment info saved to:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
