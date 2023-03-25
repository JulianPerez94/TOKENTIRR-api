import { v4 as uuidv4 } from 'uuid';
import BalanceEntity from '../../model/BalanceEntity';

import PropertyEntity from '../../model/PropertyEntity';

export default class ERC20Deploy {
  public id: string;
  private deployerId: string;
  public supply: number;
  public currentSupply: number;
  public reserveSupply: number;
  private balances: BalanceEntity[];
  private contractAddress: string;
  constructor(
    private userId: string,
    public property: PropertyEntity,
    private bankAccount: string
  ) {
    this.id = uuidv4();
    this.deployerId = userId;
    this.supply = property.fiatTotalPrice / property.tokenPrice;
    this.currentSupply = this.supply;
    this.reserveSupply = this.supply;
    this.bankAccount = bankAccount;
    this.property = property;
    this.balances = [];
    this.contractAddress = '';
  }

  setContractAddres(value: string) {
    this.contractAddress = value;
  }

  serialize() {
    const result = {
      id: this.id,
      deployerId: this.deployerId,
      supply: this.supply,
      currentSupply: this.currentSupply,
      reserveSupply: this.reserveSupply,
      bankAccount: this.bankAccount,
      property: this.property,
      balances: this.balances,
      contractAddress: this.contractAddress,
    };

    return result;
  }
}
