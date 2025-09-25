// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BadgeMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
    }

    // nftAddress => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    // seller => proceeds
    mapping(address => uint256) public proceeds;

    event Listed(address indexed nft, uint256 indexed tokenId, address seller, uint256 price);
    event Bought(address indexed nft, uint256 indexed tokenId, address buyer, uint256 price);
    event Cancelled(address indexed nft, uint256 indexed tokenId, address seller);

    function listBadge(address nft, uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be > 0");
        IERC721 badge = IERC721(nft);
        require(badge.ownerOf(tokenId) == msg.sender, "Not owner");
        require(badge.getApproved(tokenId) == address(this) || badge.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");
        listings[nft][tokenId] = Listing(msg.sender, price);
        emit Listed(nft, tokenId, msg.sender, price);
    }

    function buyBadge(address nft, uint256 tokenId) external payable nonReentrant {
        Listing memory item = listings[nft][tokenId];
        require(item.price > 0, "Not listed");
        require(msg.value == item.price, "Wrong price");
        proceeds[item.seller] += msg.value;
        delete listings[nft][tokenId];
        IERC721(nft).safeTransferFrom(item.seller, msg.sender, tokenId);
        emit Bought(nft, tokenId, msg.sender, item.price);
    }

    function cancelListing(address nft, uint256 tokenId) external {
        Listing memory item = listings[nft][tokenId];
        require(item.seller == msg.sender, "Not seller");
        delete listings[nft][tokenId];
        emit Cancelled(nft, tokenId, msg.sender);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "No proceeds");
        proceeds[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");
    }
}