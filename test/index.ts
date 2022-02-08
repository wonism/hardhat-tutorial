import { expect } from "chai";
import { ethers } from "hardhat";

import { Token } from "../typechain/Token";

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
type SignerWithAddress = Awaited<ReturnType<typeof ethers.getSigners>>[0];

describe("Greeter", () => {
  it("Should return the new greeting once it's changed", async () => {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

describe("Token contract", () => {
  let Token;
  let hardhatToken: Token;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async () => {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2] = await ethers.getSigners();
    hardhatToken = await Token.deploy();
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async () => {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      await hardhatToken.transfer(addr1.address, 50);

      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(50);

      await hardhatToken.connect(addr1).transfer(addr2.address, 50);

      expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should fail if sender doesn’t have enough tokens", async () => {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      await hardhatToken.transfer(addr1.address, 100);
      await hardhatToken.transfer(addr2.address, 50);

      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance.sub(150)
      );

      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(100);

      expect(await hardhatToken.balanceOf(addr2.address)).to.equal(50);
    });
  });
});
