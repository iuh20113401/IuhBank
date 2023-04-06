  import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
  import { expect } from "chai";
  import { ethers } from "hardhat";
  import { ERC20 } from "../typechain-types";
    describe("ERC20",function(){
  let ERC20: ERC20;
  let someaddress: SignerWithAddress;
  let someOtheraddress: SignerWithAddress;
  beforeEach(async function () {
  const ERC20ContractFactory = await ethers.getContractFactory("ERC20");
  ERC20 = await ERC20ContractFactory.deploy("Hello","SYM");
  await ERC20.deployed(); 
  someaddress = (await ethers.getSigners())[1];
  someOtheraddress = (await ethers.getSigners())[2];
  console.log("Balance:", (await someaddress.getBalance()).toString());
    ;});
    describe('when i have 10 token', function() { 
    beforeEach(async function () {
      //mint 10 token
      await ERC20.transfer(someaddress.address, 10);
    });  
    });
    describe("When i transfer 10 token", function(){
    it("should transfer tokens correctly", async function(){
      await ERC20.connect(someaddress).transfer(someOtheraddress.address,10)
      expect (
      (await ERC20.balanceOf(someaddress.address))).to.equal(10);
    });
  })
});