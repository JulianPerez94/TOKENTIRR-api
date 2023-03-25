import { v4 as uuidv4 } from 'uuid';

import config from '../config/default';
import EthersWrapper from '../domain/blockchain/EthersWrapper';
import CustomLogger from '../infrastructure/CustomLogger';
import { Service } from '../layers';
import BalanceEntity from '../model/BalanceEntity';
import ERC20Entity from '../model/ERC20Entity';
import PropertyEntity from '../model/PropertyEntity';
import UserEntity from '../model/UserEntity';
import BalanceRepo from '../repositories/BalanceRepo';

@Service()
export default class BalanceService {
  constructor(
    readonly balanceRepo: BalanceRepo,
    readonly logger: CustomLogger
  ) {}

  async buy(balance: BalanceEntity) {
    try {
      if (balance.account && balance.erc20) {
        const ew = await BalanceService.connectToEthersWrapper(
          balance.erc20.contractAddress
        );
        ew.transfer(balance.account || '', balance.tokens).then(
          async (result) => {
            if (balance.erc20) {
              try {
                await this.balanceRepo.updateOne(balance.id, {
                  hash: result.hash,
                });

                this.logger.info(
                  `Balance for contract ${balance.erc20.contractAddress} of ${balance.tokens} to account ${balance.account} executed with hash ${result.hash}`
                );
                await result.wait();

                this._updateConfirmedBalance(
                  balance,
                  balance.erc20,
                  result.hash
                );
              } catch (e) {
                this.logger.error(
                  'Error finishin updates on transfer' + e.message,
                  {
                    stack: e.stack,
                  }
                );
                throw e;
              }
            }
          }
        );
        return balance;
      }
    } catch (error) {
      this.logger.error(`Error buying tokens: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  static async connectToEthersWrapper(
    contractAddress: string
  ): Promise<EthersWrapper> {
    const signer = EthersWrapper.getSigner(config.privateKey);
    const ew = new EthersWrapper();
    await ew.connectToERC20(contractAddress, signer);
    return ew;
  }

  async findAccountBalances(account: string, erc20Id: string) {
    return await this.balanceRepo.find({
      account: account,
      erc20: {
        id: erc20Id,
      },
    });
  }

  async saveBalance(
    user: UserEntity,
    property: PropertyEntity,
    erc20: ERC20Entity,
    type: string,
    account: string,
    investment: number,
    dolars: number
  ) {
    const tokens = parseInt((dolars * 1000).toString()) / property.tokenPrice;
    const balance = {
      id: uuidv4(),
      account,
      tokens: tokens.toString(),
      type,
      investment: investment.toString(),
      dolars: dolars.toString(),
      user,
      erc20,
    } as BalanceEntity;
    const result = await this.balanceRepo.save(balance);
    this.logger.info('Balance for erc20 pending', { balance });
    return result;
  }

  private async _updateConfirmedBalance(
    balance: BalanceEntity,
    erc20: ERC20Entity,
    hash: string
  ) {
    try {
      // const accountBalances = await this.findAccountBalances(
      //   balance.account ?? '',
      //   erc20.id
      // );
      // TODO compare tokens with our dtabase BigNumber
      // const { repoTokens, erc20Tokens } = await EnsureBalancer.getTokens(
      //   accountBalances,
      //   erc20.contractAddress,
      //   balance.account ?? ''
      // );
      // this.logger.error('Tokens Balance', {
      //   database: repoTokens,
      //   erc20: erc20Tokens,
      // });
      // this._confirmBalance(balance.id, erc20Tokens, repoTokens, hash);
      this._confirmBalance(balance.id, hash);
    } catch (error) {
      this.logger.error('Error during confirmation of ERC20 account balance', {
        balance,
        erc20,
      });
      throw error;
    }
  }

  // private _confirmBalance(
  //   id: string,
  //   erc20Tokens: number,
  //   repoTokens: number,
  //   hash: string
  // ) {
  //   if (erc20Tokens === repoTokens) {
  //     this.balanceRepo.updateOne(id, { confirmed: true });
  //     this.logger.info(`Balance with has ${hash} confirmed`);
  //   } else {
  //     // TODO alert to someone there is an inconsistece
  //   }
  // }

  private _confirmBalance(id: string, hash: string) {
    this.balanceRepo.updateOne(id, { confirmed: true });
    this.logger.info(`Balance with has ${hash} confirmed`);
  }
}
