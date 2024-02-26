//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC404.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Alchemy404 is ERC404 {
    string public dataURI;
    string public baseTokenURI;
    uint256 public cost;
    uint256 public tokenId = 0;

    constructor(address _owner, uint256 _cost)
        ERC404("Alchemy404", "ALC404", 18, 10000, _owner)
    {
        balanceOf[address(this)] = 10000 * 10**18;
        cost = _cost;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function buyToken(uint256 _amount) public payable {
        require(msg.value >= cost * _amount, "not enough value sent");
        require(_amount >= 1, "Not enough tokens purchased!");
        require(tokenId <= 10000, "all tokens minted");
        for (uint256 i = 0; i < _amount; i++) {
            _transfer(address(this), msg.sender, 1 * 10**18);
            tokenId++;
        }
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function setDataURI(string memory _dataURI) public onlyOwner {
        dataURI = _dataURI;
    }

    function setTokenURI(string memory _tokenURI) public onlyOwner {
        baseTokenURI = _tokenURI;
    }

    function setNameSymbol(string memory _name, string memory _symbol)
        public
        onlyOwner
    {
        _setNameSymbol(_name, _symbol);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        if (bytes(baseTokenURI).length > 0) {
            return string.concat(baseTokenURI, Strings.toString(id));
        } else {
            uint8 seed = uint8(bytes1(keccak256(abi.encodePacked(id))));
            string memory image;
            string memory color;

            if (seed <= 50) {
                image = "blue.png";
                color = "Blue";
            } else if (seed <= 100) {
                image = "green.png";
                color = "Green";
            } else if (seed <= 160) {
                image = "red.png";
                color = "Red";
            } else if (seed <= 210) {
                image = "purple.png";
                color = "Purple";
            } else if (seed <= 245) {
                image = "orange.png";
                color = "Orange";
            } else if (seed <= 255) {
                image = "gold.png";
                color = "Gold";
            }

            string memory jsonPreImage = string.concat(
                string.concat(
                    string.concat(
                        '{"name": "ALCHEMY DIAMONDS #',
                        Strings.toString(id)
                    ),
                    '","description":"6 uniquie Alchemy Diamonds have been unleashed on Polygon Mumbai network.These diamonds are enabled by ERC404, A collection of 10,000 Alchemy Diamonds with varying rarity. unlock the true power of ERC404.","image":"'
                ),
                string.concat(dataURI, image)
            );
            string memory jsonPostImage = string.concat(
                '","attributes":[{"trait_type":"Color","value":"',
                color
            );
            string memory jsonPostTraits = '"}]}';

            return
                string.concat(
                    "data:application/json;utf8,",
                    string.concat(
                        string.concat(jsonPreImage, jsonPostImage),
                        jsonPostTraits
                    )
                );
        }
    }
}
