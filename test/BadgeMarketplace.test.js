const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BadgeMarketplace", function () {
  let badge, market, owner, seller, buyer;

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners();
    const Badge = await ethers.getContractFactory("BadgeNFT");
    badge = await Badge.deploy("EventBadge", "EVB");
    await badge.waitForDeployment();

    const Marketplace = await ethers.getContractFactory("BadgeMarketplace");
    market = await Marketplace.deploy();
    await market.waitForDeployment();

    // Mint badge to seller
    await badge.connect(owner).mintBadge(seller.address, "ipfs://badge1");
    await badge.connect(seller).setApprovalForAll(await market.getAddress(), true);
  });

  it("should allow seller to list a badge", async () => {
    await expect(
      market.connect(seller).listBadge(await badge.getAddress(), 1, ethers.parseEther("1"))
    ).to.emit(market, "Listed");
  });

  it("should allow buyer to buy a listed badge", async () => {
    await market.connect(seller).listBadge(await badge.getAddress(), 1, ethers.parseEther("1"));
    await expect(
      market.connect(buyer).buyBadge(await badge.getAddress(), 1, { value: ethers.parseEther("1") })
    ).to.emit(market, "Bought");
    expect(await badge.ownerOf(1)).to.equal(buyer.address);
  });

  it("should allow seller to withdraw proceeds", async () => {
    await market.connect(seller).listBadge(await badge.getAddress(), 1, ethers.parseEther("1"));
    await market.connect(buyer).buyBadge(await badge.getAddress(), 1, { value: ethers.parseEther("1") });
    const before = await ethers.provider.getBalance(seller.address);
    const tx = await market.connect(seller).withdrawProceeds();
    await tx.wait();
    const after = await ethers.provider.getBalance(seller.address);
    expect(after).to.be.gt(before);
  });

  it("should not allow non-owner to cancel listing", async () => {
    await market.connect(seller).listBadge(await badge.getAddress(), 1, ethers.parseEther("1"));
    await expect(
      market.connect(buyer).cancelListing(await badge.getAddress(), 1)
    ).to.be.revertedWith("Not seller");
  });
});