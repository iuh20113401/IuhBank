// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

contract ERC20{
    uint256 public totalSupply;
    string public name;
    string public symbol;
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping(address => uint256)) allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event approval(address indexed owner, address indexed spender, uint256 value);
    constructor(string memory name_, string memory symbol_){
        name = name_;
        symbol = symbol_;
        _mint(msg.sender, 100);
        }
    function _mint(address to , uint256 amount) internal  {
        require(to != address(0),"ERC20: mint to the zero address");
        totalSupply += amount;
        balanceOf[to] = balanceOf[to] + amount;
        emit Transfer(address(0), to, amount);

    }
       function _burn(address from , uint256 amount) internal  {
        require(from != address(0),"ERC20: burn to the zero address");
        totalSupply += amount;
        balanceOf[from] = balanceOf[from] - amount;
        emit Transfer(from, address(0),amount);

    }
    function transfer(address recipient, uint256 amount) external returns(bool){
        return _transfer(msg.sender, recipient, amount);
    }
    function transferFrom(address sender, address recipient, uint256 amount) external returns(bool){
        uint256 currentAllowance = allowance[sender][msg.sender];
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        allowance[sender][msg.sender] -= currentAllowance;
        emit approval(sender, msg.sender, allowance[sender][msg.sender]);
        return _transfer(sender, recipient, amount);
    }
    function approve(address spender, uint256 amount) external returns(bool){
        require( spender != address(0), "ERC20: approve to the zero address");

        allowance[msg.sender][spender] = amount;
        emit approval(msg.sender, spender, amount);
        return true;
    }
    function _transfer(address sender,address recipient, uint256 amount) private returns(bool){
        require(recipient != address(0),"ERC20: transfer to the zero address");
        uint256 senderBalances = balanceOf[sender];
        require(senderBalances >= amount,"You don't have enough token");
        balanceOf[sender] = senderBalances - amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;

    }

    
}