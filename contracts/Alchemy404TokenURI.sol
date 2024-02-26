//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC404.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Alchemy404TokenURI is ERC404 {
    string public dataURI;
    string public baseTokenURI;
    uint256 public cost;
    uint256 public tokenId = 0;
  

    constructor(address _owner, uint256 _cost, string memory _name, string memory _symbol, uint256 _supply)
        ERC404( _name, _symbol, 18, _supply, _owner)
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
            return string.concat(baseTokenURI, Strings.toString(id));
    }
}
