const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const Election = await hre.ethers.getContractFactory("Election");
  const election = await Election.deploy();

  await election.waitForDeployment();

  const contractAddress = await election.getAddress();
  const artifact = await hre.artifacts.readArtifact("Election");
  const network = await hre.ethers.provider.getNetwork();

  const config = {
    contractAddress,
    abi: artifact.abi,
    network: {
      name: hre.network.name,
      chainId: Number(network.chainId),
      url: "PASTURLOCALHOST",
    },
  };

  const blockchainDir = path.join(__dirname, "..", "blockchain");
  const configPath = path.join(blockchainDir, "contractConfig.js");

  fs.mkdirSync(blockchainDir, { recursive: true });

  fs.writeFileSync(
    configPath,
    `module.exports = ${JSON.stringify(config, null, 2)};\n`,
    "utf8"
  );

  console.log("Election contract deployed successfully");
  console.log("Contract address:", contractAddress);
  console.log("Config written to:", configPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
