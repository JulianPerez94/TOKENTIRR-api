/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import config from '../../src/config/default';
import EthersWrapper from '../../src/domain/blockchain/EthersWrapper';

if (process.env.TEST_CI) {
  describe('Ether Wrapper', () => {
    it('ERC20', async () => {
      const ew = new EthersWrapper();
      await ew.deployERC20(1000);

      await initsFineWithSupplyApplied(ew);
      await ownerCanTransfer(ew);
      await canConnectToAnSC(ew);
      await onlyOwnerCanMint(ew);
      await onlyOwnerCanTransfer(ew);
      // await ownerCanMint(ew);
    });
    // TODO needs to change the contract to test it in future
    it.skip('Existing ERC20 owner can mint', async () => {
      const contractAddress = '0x6B211Fdf6Ef20104395d5838b690E124faFD4Fc8';
      const signer = EthersWrapper.getSigner(config.privateKey);
      const ew = new EthersWrapper();
      const contract = await ew.connectToERC20(contractAddress, signer);
      expect(contract.address).to.eq(contractAddress);

      await ownerCanMint(ew);
    });
  });

  const initsFineWithSupplyApplied = async (ew: EthersWrapper) => {
    // expect((await ew.balanceOfWallet()).toNumber()).to.eq(1000);
    expect(await ew.contractOwner()).to.eq(config.address);
    expect(Boolean(await ew.contractAddress())).to.be.true;
    expect((await ew.contractAddress()) !== config.address).to.be.true;
  };

  const canConnectToAnSC = async (ew: EthersWrapper) => {
    const TRANSFERED = 200;
    const SUPPLY_AND_MINT_LESS_TRANSFER = (1000 - TRANSFERED) * 10 ** 18;
    const contractAddress = await ew.contractAddress();
    const signer = EthersWrapper.getSigner(process.env.TEST_PRIVATE_KEY);
    const contract = await ew.connectToERC20(contractAddress, signer);
    expect(contract.address).to.eq(contractAddress);
    expect(Number(await contract.balanceOf(config.address))).to.eq(
      SUPPLY_AND_MINT_LESS_TRANSFER
    );
    expect(
      Number(await contract.balanceOf(process.env.TEST_WALLET_ADDRESS))
    ).to.eq(TRANSFERED * 10 ** 18);
  };

  const ownerCanMint = async (ew: EthersWrapper) => {
    const result = await waitFor(ew.mint(100));
    expect(Number(result.events[0].args.value)).to.eq(100);
  };

  const ownerCanTransfer = async (ew: EthersWrapper) => {
    const result = await waitFor(
      ew.transfer(process.env.TEST_WALLET_ADDRESS || '', 200)
    );
    expect(Number(result.events[0].args.value)).to.eq(200000000000000000000);
  };

  const onlyOwnerCanMint = async (ew: EthersWrapper) => {
    try {
      await waitFor(ew.mint(100));
      throw new Error('Test only owner can mint no pass');
    } catch (e) {
      expect(e.message.includes('Ownable: caller is not the owner')).to.eq(
        true
      );
    }
  };

  const onlyOwnerCanTransfer = async (ew: EthersWrapper) => {
    try {
      await waitFor(ew.transfer(process.env.TEST_WALLET_ADDRESS || '', 200));
      throw new Error('Test only owner can transfer no pass');
    } catch (e) {
      expect(e.message.includes('Ownable: caller is not the owner')).to.eq(
        true
      );
    }
  };
}

const waitFor = async (result: any) => {
  return (await result).wait();
};
