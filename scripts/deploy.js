const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  try {
    const xDaiTokenAddress = "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"; // xDai token address on Gnosis Chain
    const entryFee = hre.ethers.parseEther("10"); // 10 xDai entry fee

    console.log("Deploying FantasyFootball contract...");
    const FantasyFootball = await hre.ethers.getContractFactory("FantasyFootball");
    const fantasyFootball = await FantasyFootball.deploy(xDaiTokenAddress, entryFee);

    await fantasyFootball.waitForDeployment();

    const deployedAddress = await fantasyFootball.getAddress();
    console.log("FantasyFootball deployed to:", deployedAddress);

    // Optional: Save deployment info to a file
    const fs = require('fs');
    const deploymentInfo = {
      network: hre.network.name,
      address: deployedAddress,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
