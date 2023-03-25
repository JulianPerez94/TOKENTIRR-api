import { expect } from 'chai';
import { ethers } from 'hardhat';
const propietaryAddress = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';
describe('TokentirrProperty ERC-20', function () {
  it('needs to use init method to establish the initial supply balance to the owner', async function () {
    const supply = 10000;
    const [owner] = await ethers.getSigners();
    const erc20 = await ethers.getContractFactory('TokentirrProperty');

    const erc20Property = await erc20.deploy();
    erc20Property.init(supply);
    const ownerBalance = await erc20Property.balanceOf(owner.address);
    const contractSupply = await erc20Property.totalSupply();

    expect(contractSupply).to.equal(ownerBalance);
    expect(ownerBalance).to.equal(supply);
  });

  it('can set 100 PTIRR tokens to an account', async function () {
    const supply = 10000;
    const pTirr = 100;
    const { erc20Property, owner } = await startERC20(supply);

    erc20Property.transfer(propietaryAddress, pTirr);
    const propietaryAddressBalance = await erc20Property.balanceOf(
      propietaryAddress
    );

    const ownerBalance = await erc20Property.balanceOf(owner.address);

    expect(propietaryAddressBalance).to.equal(pTirr);
    expect(parseInt(ownerBalance) + pTirr).to.equal(supply);
  });
});

const startERC20 = async (supply) => {
  const [owner] = await ethers.getSigners();
  const erc20 = await ethers.getContractFactory('TokentirrProperty');

  const erc20Property = await erc20.deploy();
  erc20Property.init(supply);

  return {
    owner,
    erc20Property,
  };
};
