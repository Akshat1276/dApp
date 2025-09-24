// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BadgeNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event BadgeMinted(uint256 indexed tokenId, address indexed to, string tokenURI_);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {}

    function mintBadge(address to, string memory tokenURI_) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid recipient");
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _safeMint(to, newId);
        _setTokenURI(newId, tokenURI_);
        emit BadgeMinted(newId, to, tokenURI_);
        return newId;
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIds.current();
    }
}