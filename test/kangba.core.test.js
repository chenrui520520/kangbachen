const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KangBa core contracts", function () {
  async function deployFurnaceFixture() {
    const [owner, user] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("SoulCardNFT");
    const nft = await NFT.deploy(owner.address, "ipfs://kangba/{id}.json");

    const Random = await ethers.getContractFactory("RandomSourceMock");
    const random = await Random.deploy();

    const Furnace = await ethers.getContractFactory("FurnaceCore");
    const furnace = await Furnace.deploy(await nft.getAddress(), await random.getAddress());

    await nft.setFurnaceOperator(await furnace.getAddress(), true);
    return { owner, user, nft, random, furnace };
  }

  it("KangBaToken: owner can mint", async function () {
    const [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("KangBaToken");
    const token = await Token.deploy(owner.address);

    await token.mint(user.address, ethers.parseEther("100"));
    expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("100"));
  });

  it("Synthesis success via async randomness", async function () {
    const { user, nft, random, furnace } = await deployFurnaceFixture();

    await nft.mintCard(user.address, 0, 2);
    const reqTx = await furnace.connect(user).requestSynthesis(0);
    const receipt = await reqTx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "SynthesisRequested");
    const requestId = event.fragment ? event.args.requestId : 1n;

    await random.fulfill(await furnace.getAddress(), requestId, 1);

    expect(await nft.balanceOf(user.address, await nft.tokenIdByLevel(0))).to.equal(0);
    expect(await nft.balanceOf(user.address, await nft.tokenIdByLevel(1))).to.equal(1);
  });

  it("Synthesis failure adds lucky points and fragments", async function () {
    const { user, nft, random, furnace } = await deployFurnaceFixture();

    await nft.mintCard(user.address, 0, 2);
    const reqTx = await furnace.connect(user).requestSynthesis(0);
    const receipt = await reqTx.wait();
    const event = receipt.logs.find((l) => l.fragment && l.fragment.name === "SynthesisRequested");
    const requestId = event.fragment ? event.args.requestId : 1n;

    await random.fulfill(await furnace.getAddress(), requestId, 9999);

    expect(await nft.luckyPoints(user.address)).to.equal(1);
    expect(await nft.fragments(user.address)).to.equal(1);
    expect(await nft.balanceOf(user.address, await nft.tokenIdByLevel(0))).to.equal(1);
  });
});
