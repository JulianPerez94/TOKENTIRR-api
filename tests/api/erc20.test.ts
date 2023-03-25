import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import { login, addProperty } from '../test_support';
import config from '../../src/config/default';
import sleep from '../../src/utils/sleep';
import ERC20 from '../../src/domain/entities/ERC20Deploy';
import ERC20Repo from '../../src/repositories/ERC20Repo';
import EthersWrapper from '../../src/domain/blockchain/EthersWrapper';
import BalanceEntity from '../../src/model/BalanceEntity';
const CREATED = 201;
let contractAddress: string;
let propertyId: string;
if (process.env.TEST_CI) {
  describe('ERC20', () => {
    it('can be deployed', async () => {
      const validatedEmail = config.validatedEmails.split(',')[0];
      const accessToken = await login(server, validatedEmail);
      const { body: property } = await addProperty(server, validatedEmail);
      propertyId = property.id as string;
      const response = await request(await server)
        .post('/api/v1/erc20')
        .send({
          propertyId: property.id,
          bankAccount: 'bank-account',
        })
        .set({ Authorization: `Bearer ${accessToken}` });

      expect(response.status).to.eq(CREATED);
      expect(Boolean(response.body.property.id)).to.eq(true);
      expect(response.body.supply).to.eq(100000);
      expect(response.body.currentSupply).to.eq(100000);
      expect(response.body.reserveSupply).to.eq(100000);
      expect(response.body.balances.length).to.eq(0);
      expect(Boolean(response.body.contractAddress)).to.eq(false);
      await sleep(30000);

      const result = await request(await server)
        .get('/api/v1/erc20')
        .set({ Authorization: `Bearer ${accessToken}` });
      const contract = result.body.filter(
        (i: ERC20) => i.id === response.body.id
      )[0];
      contractAddress = contract.contractAddress as string;
      expect(Boolean(contract.contractAddress)).to.eq(true);

      const propertyUpdated = await request(await server).get(
        `/api/v1/property/${propertyId}`
      );
      expect(Boolean(propertyUpdated.body.erc20)).to.eq(true);
    });
    it('can buy tokens', async () => {
      const accessToken = await login(server);
      const response = await request(await server)
        .post('/api/v1/tokens')
        .send({
          propertyId,
          type: 'Dolar',
          account: process.env.TEST_WALLET_ADDRESS,
          investment: 100,
          dolars: 100,
        })
        .set({ Authorization: `Bearer ${accessToken}` });
      expect(response.body.tokens).to.eq('1');
      expect(Boolean(response.body.confirmed)).to.eq(false);
      expect(Boolean(response.body.hash)).to.eq(false);
      await sleep(30000);
      const erc20 = await new ERC20Repo().find({ contractAddress });
      const balance = erc20[0].balances?.filter(
        (i) => i.id === response.body.id
      )[0] as unknown as BalanceEntity;
      expect(Boolean(balance.hash)).to.eq(true);
      // expect(balance.confirmed).to.eq(true);
      const signer = EthersWrapper.getSigner(config.privateKey);
      const ew = new EthersWrapper();
      await ew.connectToERC20(contractAddress, signer);
      expect(
        (await ew.balanceOfWallet(process.env.TEST_WALLET_ADDRESS)).toString()
      ).to.eq('1000000000000000000');
    });
  });
}
