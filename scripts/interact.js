const hre = require("hardhat");

async function main() {
  const contractAddress = "0x506344cf78b8F5E99AaDbB4D905A319dea108F93"; // Replace with your contract address
  const FantasyFootball = await hre.ethers.getContractFactory("FantasyFootball");
  const fantasyFootball = await FantasyFootball.attach(contractAddress);

  // Example: Get the entry fee
  const entryFee = await fantasyFootball.entryFee();
  console.log("Entry Fee:", hre.ethers.formatEther(entryFee), "xDAI");

  // Example: Register a team (make sure you have approved the contract to spend your xDAI first)
  const tx = await fantasyFootball.registerTeam();
  await tx.wait();
  console.log("Team registered!");

  // Add more interactions as needed
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
