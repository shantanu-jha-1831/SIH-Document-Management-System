import { network } from "hardhat";

const { ethers } = await network.connect();

const documentRegistry =
    await ethers.deployContract("DocumentRegistry");

await documentRegistry.waitForDeployment();

console.log(
    "DocumentRegistry deployed to:",
    await documentRegistry.getAddress()
);