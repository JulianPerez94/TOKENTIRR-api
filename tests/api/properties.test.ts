import * as request from 'supertest';
import { expect } from 'chai';
import server from '../test_support/server';
import { login, propertyToTest, addProperty } from '../test_support';
const CREATED = 201;

describe('Property', () => {
  it('can be added', async () => {
    const accessToken = await login(server);

    const response = await request(await server)
      .post('/api/v1/property')
      .send(propertyToTest)
      .set({ Authorization: `Bearer ${accessToken}` });
    const result = response.body;
    expect(response.statusCode).to.eq(CREATED);
    expect(result.mainImage).to.eq(propertyToTest.mainImage);
    expect(result.description).to.eq(propertyToTest.description);
    expect(result.images.length).to.eq(propertyToTest.images.length);
    expect(result.images[0]).to.eq(propertyToTest.images[0]);
    expect(result.street).to.eq(propertyToTest.street);
    expect(result.streetNumber).to.eq(propertyToTest.streetNumber);
    expect(result.city).to.eq(propertyToTest.city);
    expect(result.state).to.eq(propertyToTest.state);
    expect(result.postalCode).to.eq(propertyToTest.postalCode);
    expect(result.tokenPrice).to.eq(propertyToTest.tokenPrice);
    expect(result.fiatTotalPrice).to.eq(propertyToTest.fiatTotalPrice);
    expect(result.availableTokens).to.eq(propertyToTest.availableTokens);
    expect(result.totalTokens).to.eq(propertyToTest.totalTokens);
    expect(result.closingCosts).to.eq(propertyToTest.closingCosts);
    expect(result.companyIncorporationExpenses).to.eq(
      propertyToTest.companyIncorporationExpenses
    );
    expect(result.initialMaintenanceReserve).to.eq(
      propertyToTest.initialMaintenanceReserve
    );
    expect(result.vacancyReserve).to.eq(propertyToTest.vacancyReserve);
    expect(result.tokentirrFee).to.eq(propertyToTest.tokentirrFee);
    expect(result.irr).to.eq(propertyToTest.irr);
    expect(result.roi).to.eq(propertyToTest.roi);
    expect(result.inversionAverageValue).to.eq(
      propertyToTest.inversionAverageValue
    );
    expect(result.annualGrossRents).to.eq(propertyToTest.annualGrossRents);
    expect(result.municipalTaxes).to.eq(propertyToTest.municipalTaxes);
    expect(result.homeownersInsurance).to.eq(
      propertyToTest.homeownersInsurance
    );
    expect(result.propertyManagement).to.eq(propertyToTest.propertyManagement);
    expect(result.llcAndFilingFees).to.eq(propertyToTest.llcAndFilingFees);
    expect(result.annualCashFlow).to.eq(propertyToTest.annualCashFlow);
    expect(result.monthlyCashFlow).to.eq(propertyToTest.monthlyCashFlow);
  });

  it('public detail can be find', async () => {
    const porpertyAdded = await addProperty(server);

    const response = await request(await server).get(
      `/api/v1/property/${porpertyAdded.body.id}`
    );

    expect(response.status).to.eq(200);
    expect(Boolean(porpertyAdded.body.images.length > 0)).to.be.true;
    expect(porpertyAdded.body.images.length).to.eq(response.body.images.length);
  });
});
