require("dotenv").config();
const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const getTheAbi = () => {
  try {
    const dir = path.resolve(
      __dirname,
      "../artifacts/contracts/Alchemy404.sol/Alchemy404.json" // hardhat build dir
    );
    const file = fs.readFileSync(dir, "utf8");
    const json = JSON.parse(file);
    return json.abi;
  } catch (e) {
    console.log(`e`, e);
  }
};
async function main() {
  const abi = getTheAbi();
  const address = process.env.OWNER_WALLET_ADDRESS; //owner address
  const args = [address, 0]; //constructor args
  const dataURL = "https://raw.githubusercontent.com/DiaD3v/Diamonds/main/"; //data url for images

  const alch404 = await hre.ethers.deployContract("Alchemy404", args);

  await alch404.waitForDeployment();

  console.log(`Contract Alchemy404 deployed to ${alch404.target}`);

  //wait for 2
  let currentBlock = await hre.ethers.provider.getBlockNumber();
  while (currentBlock + 2 > (await hre.ethers.provider.getBlockNumber())) {}

  const signer = await ethers.provider.getSigner();
  const contract = new ethers.Contract(alch404.target, abi, signer);

  //set dataURL
  await contract.setDataURI(dataURL, { gasLimit: 5000000 });
  let nextBlock = await hre.ethers.provider.getBlockNumber();
  while (nextBlock + 2 > (await hre.ethers.provider.getBlockNumber())) {}
  console.log(`datauri set to `, await contract.dataURI());

  //set the whitelist
  await contract.setWhitelist(alch404.target, true);
  let next1Block = await hre.ethers.provider.getBlockNumber();
  while (next1Block + 2 > (await hre.ethers.provider.getBlockNumber())) {}
  console.log("Is whitelisted? ", await contract.whitelist(alch404.target));

  //verify contract
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: alch404.target,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
