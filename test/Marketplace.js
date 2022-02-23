const { expect } = require("chai");

describe("Marketplace", function () {
  it("Can create a market item and fetch it", async function () {
    const [owner] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");

    const hardhatToken = await Marketplace.deploy();

    await hardhatToken.createMarketItem("desc", "title", 145);

    listings = await hardhatToken.fetchNumberListings()
    console.log(listings)

    expect(1).to.equal(listings.length);
    expect("desc").to.equal(listings[0].description)
    expect("title").to.equal(listings[0].title)
    expect(145).to.equal(listings[0].targetFundingPrice)

  });

  it("Contribute to a project", async function () {
    const [owner] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");

    const hardhatToken = await Marketplace.deploy();

    await hardhatToken.createMarketItem("desc", "title", ethers.utils.parseEther('145'));

    const txOverrides = {
      value: ethers.utils.parseEther('0.01')
    };

    await hardhatToken.contributeToProject(1, txOverrides)

    listings = await hardhatToken.fetchContributors();
    console.log(listings)

    expect(1).to.equal(listings.length);
    expect(1).to.equal(listings[0].itemId)
    expect(owner.address).to.equal(listings[0].sender)
    expect(txOverrides.value).to.equal(listings[0].contribution)

  });

  it("Cannot contribute to invalid project", async function () {
    const [owner] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");

    const hardhatToken = await Marketplace.deploy();

    await hardhatToken.createMarketItem("desc", "title", 145);

    const txOverrides = {
      value: ethers.utils.parseEther('0.01')
    };

    await expect(hardhatToken.contributeToProject(2, txOverrides)).to.be.revertedWith("project id must be valid")

    listings = await hardhatToken.fetchContributors();
    console.log(listings)

    expect(0).to.equal(listings.length);
  
  });

  it("Cannot contribute more than project funding", async function () {
    const [owner] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");

    const hardhatToken = await Marketplace.deploy();

    await hardhatToken.createMarketItem("desc", "title", ethers.utils.parseEther('1'));

    const txOverrides = {
      value: ethers.utils.parseEther('10')
    };

    await expect(hardhatToken.contributeToProject(1, txOverrides)).to.be.revertedWith("contribution to project cannot be higher than targetPrice")

    listings = await hardhatToken.fetchContributors();
    console.log(listings)

    expect(0).to.equal(listings.length);
  
  });

  it("Cannot contribute to expired project", async function () {
    const [owner] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");

    const hardhatToken = await Marketplace.deploy();

    await hardhatToken.createMarketItem("desc", "title", ethers.utils.parseEther('1'));

    await ethers.provider.send("evm_increaseTime", [2678400]) // 31 days

    await ethers.provider.send("evm_mine")

    const txOverrides = {
      value: ethers.utils.parseEther('0.01')
    };

    await expect(hardhatToken.contributeToProject(1, txOverrides)).to.be.revertedWith("Project deadline must be in the future")

    listings = await hardhatToken.fetchContributors();
    console.log(listings)

    expect(0).to.equal(listings.length);
  
  });


  it("Can claim back its donation from expired project", async function () {
    const [owner] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");

    const hardhatToken = await Marketplace.deploy();

    await hardhatToken.createMarketItem("desc", "title", ethers.utils.parseEther('145'));

    const txOverrides = {
      value: ethers.utils.parseEther('1')
    };

    const beforeBalance = await ethers.provider.getBalance(owner.address);

    await hardhatToken.contributeToProject(1, txOverrides)

    await ethers.provider.send("evm_increaseTime", [2678400]) // 31 days

    await ethers.provider.send("evm_mine")

    const receipt = await hardhatToken.claimBackDonationMissedProjectDeadline(1)

    console.log(receipt)
    console.log(beforeBalance)
    const afterBalance = await ethers.provider.getBalance(owner.address);

    const gasUsed = BigInt(receipt.gasLimit) * BigInt(receipt.gasPrice);
    expect(BigInt(beforeBalance) - gasUsed).to.equal(BigInt(afterBalance));
  
  });


});