const main = async () => {
  const clContractFactory = await hre.ethers.getContractFactory("Marketplace");
  const clContract = await clContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.001"),
  });

  await clContract.deployed();

  console.log("CL contract address: ", clContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();