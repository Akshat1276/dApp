const { ethers } = require("hardhat");

async function main() {
  // Deploy BadgeNFT
  const Badge = await ethers.getContractFactory("BadgeNFT");
  const badge = await Badge.deploy("EventBadge", "EVB");
  await badge.waitForDeployment();
  console.log("BadgeNFT deployed to:", await badge.getAddress());

  // Deploy BadgeMarketplace
  const Marketplace = await ethers.getContractFactory("BadgeMarketplace");
  const market = await Marketplace.deploy();
  await market.waitForDeployment();
  console.log("BadgeMarketplace deployed to:", await market.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});