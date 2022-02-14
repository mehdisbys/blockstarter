// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Nader's Digital Marketplace", "NDM") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}

contract Marketplace is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable owner;
  uint256 listingFee = 0.1 ether;

  struct MarketItem {
    uint itemId;
    string title;
    string description;
    uint256 deadline;
    address payable seller;
    uint256 targetFundingPrice;
  }

  event MarketItemCreated (
    uint indexed itemId,
    string title,
    string description,
    uint256 deadline,
    address seller,
    uint256 targetFundingPrice
  );

  struct Contributor {
    uint itemId;
    address sender;
    uint256 contribution;
  }

  event ContributorDonated (
    uint indexed itemId,
    address sender,
    uint256 contribution
  );
  
  mapping(uint256 => MarketItem) private idToMarketItem;
  MarketItem[] marketItems;
  Contributor[] contributors;

  constructor() payable {
    owner = payable(msg.sender);
  }

  function getMarketItem(uint256 marketItemId) public view returns (MarketItem memory) {
    return idToMarketItem[marketItemId];
  }

  function createMarketItem(
    string calldata description,
    string calldata title,
    uint256 funding
  ) public payable nonReentrant {
    require(funding > 0, "Funding must be at least 1 wei");
    //require(msg.value == listingFee, "Listing fee must be equal to 0.1");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    uint256 deadline = block.timestamp + (30 days);
  
    idToMarketItem[itemId] =  MarketItem(
      itemId,
      title,
      description,
      deadline,
      payable(msg.sender),
      funding
    );

    marketItems.push(MarketItem(
      itemId,
      title,
      description,
      deadline,
      payable(msg.sender),
      funding
    ));

    emit MarketItemCreated(
      itemId,
      title,
      description,
      deadline,
      msg.sender,
      funding  
    );
  }

  function fetchAllListings() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](itemCount);

    for (uint i = 0; i < totalItemCount; i++) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
    }
   
    return items;
  }

  function fetchNumberListings() public view returns (MarketItem[] memory) {
    return marketItems;
  }


  function contributeToProject(uint itemId) public payable {
    require(msg.value > 0, "contribution must be superior to zero");
    require(idToMarketItem[itemId].itemId > 0, "project id must be valid");
    contributors.push(Contributor(itemId, msg.sender, msg.value));
    emit ContributorDonated(itemId, msg.sender, msg.value);
  }

  function fetchContributors() public view returns (Contributor[] memory) {
    return contributors;
  }

  fallback () external payable {}
  receive() external payable {}

}