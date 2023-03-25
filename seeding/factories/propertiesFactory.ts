// @/src/db/seeding/factories/user.factory.ts
import { define } from 'typeorm-seeding';

import PropertyEntity from '../../src/model/PropertyEntity';
import { getRndInteger } from '../helpers';
import { properties } from '../demoProperties';
define(PropertyEntity, () => {
  const property = new PropertyEntity();
  const index = getRndInteger(0, properties.length - 1);
  property.id = properties[index].id;
  property.mainImage = properties[index].mainImage;
  property.street = properties[index].street;
  property.streetNumber = properties[index].streetNumber;
  property.description = properties[index].description;
  property.images = properties[index].images;
  property.city = properties[index].city;
  property.state = properties[index].state;
  property.postalCode = properties[index].postalCode;
  property.tokenPrice = properties[index].tokenPrice;
  property.fiatTotalPrice = properties[index].fiatTotalPrice;
  property.availableTokens = properties[index].availableTokens;
  property.totalTokens = properties[index].totalTokens;
  property.closingCosts = properties[index].closingCosts;
  property.companyIncorporationExpenses =
    properties[index].companyIncorporationExpenses;
  property.initialMaintenanceReserve =
    properties[index].initialMaintenanceReserve;
  property.vacancyReserve = properties[index].vacancyReserve;
  property.tokentirrFee = properties[index].tokentirrFee;
  property.irr = properties[index].irr;
  property.roi = properties[index].roi;
  property.inversionAverageValue = properties[index].inversionAverageValue;
  property.annualGrossRents = properties[index].annualGrossRents;
  property.municipalTaxes = properties[index].municipalTaxes;
  property.homeownersInsurance = properties[index].homeownersInsurance;
  property.propertyManagement = properties[index].propertyManagement;
  property.llcAndFilingFees = properties[index].llcAndFilingFees;
  property.annualCashFlow = properties[index].annualCashFlow;
  property.monthlyCashFlow = properties[index].monthlyCashFlow;
  property.createdAt = new Date();
  property.updatedAt = new Date()

  return property;
});
