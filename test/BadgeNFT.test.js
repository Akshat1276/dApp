const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BadgeNFT", function () {
  let badge, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Badge = await ethers.getContractFactory("BadgeNFT");
    badge = await Badge.deploy("EventBadge", "EVB");
    await badge.waitForDeployment();
  });

  it("deploys with correct name and symbol", async () => {
    expect(await badge.name()).to.equal("EventBadge");
    expect(await badge.symbol()).to.equal("EVB");
  });

  it("owner can mint and sets tokenURI", async () => {
    const mintTx = await badge.mintBadge(user.address, "ipfs://sample-json");
    await mintTx.wait();
    const tokenId = await badge.totalMinted();
    expect(await badge.ownerOf(tokenId)).to.equal(user.address);
    expect(await badge.tokenURI(tokenId)).to.equal("ipfs://sample-json");
  });

  it("non-owner cannot mint", async () => {
    await expect(
      badge.connect(user).mintBadge(user.address, "ipfs://x")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});