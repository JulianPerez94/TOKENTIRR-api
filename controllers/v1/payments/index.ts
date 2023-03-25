interface Amount {
  amount: string;
  currency: string;
}

interface Fees {
  amount: string;
  currency: string;
}

interface SettlementAmount {
  amount: string;
  currency: string;
}

interface DepositAddress {
  chain: string;
  address: string;
}
interface PaidPayment {
  id: string;
  type: string;
  status: string;
  amount: Amount;
  fees: Fees;
  createDate: Date;
  updateDate: Date;
  merchantId: string;
  merchantWalletId: string;
  paymentIntentId: string;
  settlementAmount: SettlementAmount;
  depositAddress: DepositAddress;
  transactionHash: string;
}
export default PaidPayment;
