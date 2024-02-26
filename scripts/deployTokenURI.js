require("dotenv").config();
const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const getTheAbi = () => {
  try {
    const dir = path.resolve(
      __dirname,
      "../artifacts/contracts/Alchemy404TokenURI.sol/Alchemy404TokenURI.json" // hardhat build dir
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
  const args = [address, 0, "ALCHmonkeys", "AMonk404", 10000]; //constructor args owner, cost, name, symbol, _supply
  // const dataURL = "https://raw.githubusercontent.com/DiaD3v/Diamonds/main/"; //data url for images
  // const tokenURI =  "https://raw.githubusercontent.com/leetebbs/images/main/"; //base TOKENURI for json files
  const tokenURI =  "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/"; //base TOKENURI for json files BAYC

  const alch404 = await hre.ethers.deployContract("Alchemy404TokenURI", args);

  await alch404.waitForDeployment();

  console.log(`Contract Alchemy404TokenURI deployed to ${alch404.target}`);

  //wait for 2
  let currentBlock = await hre.ethers.provider.getBlockNumber();
  while (currentBlock + 2 > (await hre.ethers.provider.getBlockNumber())) {}

  const signer = await ethers.provider.getSigner();
  const contract = new ethers.Contract(alch404.target, abi, signer);

  //set dataURL
  // await contract.setDataURI(dataURL, { gasLimit: 5000000 });
  // let nextBlock = await hre.ethers.provider.getBlockNumber();
  // while (nextBlock + 2 > (await hre.ethers.provider.getBlockNumber())) {}
  // console.log(`datauri set to `, await contract.dataURI());

  //set TokenURI
  await contract.setTokenURI(tokenURI, { gasLimit: 5000000 });
  let nextBlock = await hre.ethers.provider.getBlockNumber();
  while (nextBlock + 3 > (await hre.ethers.provider.getBlockNumber())) {}
  console.log(`tokenURI set to `, await contract.tokenURI(0));

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
