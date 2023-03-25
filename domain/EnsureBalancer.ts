import config from '../config/default';
import BalanceEntity from '../model/BalanceEntity';
import EthersWrapper from './blockchain/EthersWrapper';

export default class EnsureBalancer {
  static async getTokens(
    repoAccountBalances: BalanceEntity[],
    contractAddress: string,
    account: string
  ) {
    const repoTokens =
      EnsureBalancer._sumBalancesForAccount(repoAccountBalances);
    const erc20Tokens = await EnsureBalancer._getFromContract(
      contractAddress,
      account
    );

    return {
      repoTokens,
      erc20Tokens,
    };
  }

  static _sumBalancesForAccount(repoAccountBalances: BalanceEntity[]) {
    return repoAccountBalances.reduce((acc, balance) => {
      acc += parseInt(balance.tokens);
      return acc;
    }, 0);
  }

  static async _getFromContract(contractAddress: string, account: string) {
    const signer = EthersWrapper.getSigner(config.privateKey);
    const ew = new EthersWrapper();
    await ew.connectToERC20(contractAddress, signer);
    return await ew.balanceOfWallet(account);
  }
}
