// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run("compile");

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // We get the contract to deploy
  const [Greeter, Token] = await Promise.all([
    hre.ethers.getContractFactory("Greeter"),
    hre.ethers.getContractFactory("Token"),
  ]);

  const [greeter, token] = await Promise.all([
    Greeter.deploy("Hello, Hardhat!"),
    Token.deploy(),
  ]);

  await greeter.deployed();
  await token.deployed();

  const totalSupply = await token.totalSupply();

  console.log("Greeter deployed to:", greeter.address);
  console.log("Token's total supply:", totalSupply);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
