const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FantasyFootball", function () {
  let FantasyFootball, fantasyFootball, owner, addr1, addr2;
  const entryFee = ethers.parseEther("10"); // 10 xDai

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    FantasyFootball = await ethers.getContractFactory("FantasyFootball");
    fantasyFootball = await FantasyFootball.deploy("0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", entryFee);
  });

  it("Should set the right owner", async function () {
    expect(await fantasyFootball.owner()).to.equal(owner.address);
  });

  it("Should set the correct entry fee", async function () {
    expect(await fantasyFootball.entryFee()).to.equal(entryFee);
  });

  // Add more tests for your contract functions
});
