//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import './Tether.sol';
import './RWD.sol';

contract DecentralBank {
    string public name = "Decentral Bank";
    address public owner;

    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaked;

    Tether public tether;
    RWD public rwd;

    constructor(Tether _tether,RWD _rwd) {
        tether = _tether;
        rwd = _rwd;
        owner = msg.sender;
        
    }

    function depositTokens(uint _amount) public {
        require(_amount > 0,"Enter a valid amount");
        require(tether.balanceOf(msg.sender) >= _amount, "Not enough funds");        
        tether.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] += _amount;

        if(hasStaked[msg.sender] == false) {
            stakers.push(msg.sender);
        }
        isStaked[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0,'staking balance cannot be less than zero');

        //transfer the tokens to the specified tokens
        tether.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;
        isStaked[msg.sender] = false;


    }


    function issueTokens() public {
        require(msg.sender == owner,"Caller must be the owner");
        for(uint i=0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient] / 9;
            if(balance > 0){
            rwd.transfer(recipient, balance);
            }
        }
    }
}