import { BigNumberish, ContractFactory, ethers } from 'ethers';
import '@ethersproject/shims';
import config from '../../config/default';
import * as erc20 from '../../../artifacts/contracts/ERC20.sol/TokentirrProperty.json';

export default class EthersWrapper {
  private readonly blockchain: {
    provider: ethers.providers.JsonRpcProvider;
    signer: ethers.providers.JsonRpcSigner;
  };
  private erc20: ethers.Contract;
  constructor() {
    const provider = new ethers.providers.JsonRpcProvider(config.rpc);
    this.blockchain = {
      provider,
      signer: provider.getSigner(),
    };
  }

  async connectToERC20(contractAddress: string, signer: ethers.Signer) {
    this.erc20 = new ethers.Contract(
      contractAddress,
      erc20.abi,
      signer || this.blockchain.provider
    );
    return this.erc20;
  }

  async deployERC20(supply: BigNumberish) {
    const amount = ethers.utils.parseUnits(supply.toString(), 18);
    await this.blockchain.provider.ready;
    const signer = EthersWrapper.getSigner();
    const factory = new ContractFactory(erc20.abi, erc20.bytecode, signer);
    this.erc20 = await factory.deploy();
    await this.erc20.deployTransaction.wait();
    await (await this.erc20.init(amount)).wait();
  }

  static getSigner(privateKey = config.privateKey) {
    const provider = new ethers.providers.JsonRpcProvider(config.rpc);
    return new ethers.Wallet(privateKey, provider);
  }

  async balanceOfWallet(wallet = config.address) {
    return await this.erc20.balanceOf(wallet);
  }

  async contractOwner(contract = this.erc20) {
    return contract.signer.getAddress();
  }

  async contractAddress(contract = this.erc20) {
    return contract.address;
  }

  async mint(amount: number, contract = this.erc20) {
    return await contract.mint(amount);
  }

  async transfer(to: string, tokens: BigNumberish, contract = this.erc20) {
    const amount = ethers.utils.parseUnits(tokens.toString(), 18);
    return await contract.transfer(to, amount);
  }
}
