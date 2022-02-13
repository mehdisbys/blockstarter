const { expect } = require("chai");

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
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
});