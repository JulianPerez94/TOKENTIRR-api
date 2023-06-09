import { v4 as uuidv4 } from 'uuid';

const properties = [
  {
    id: uuidv4(),
    mainImage: 'Burnside-av-509-main.jpg',
    street: 'Burnside Avle 1',
    streetNumber: '509',
    description:
      'Vivienda multifamily situada en 509 Burnside Avle 1, cuenta con unos inquilinos desde hace 8 años, se trata de una vivienda suscrita al programa B1 del gobierno de EEUU. ',
    images: ['12E52506-6199-486F-AA23-60F86480FC42_1_105_c.jpeg'],
    city: 'Hartford',
    state: 'Connecticut',
    postalCode: '06108',
    tokenPrice: 1000,
    fiatTotalPrice: 115000000,
    availableTokens: 2000,
    totalTokens: 115000000 / 1000,
    closingCosts: 150000,
    companyIncorporationExpenses: 350000,
    initialMaintenanceReserve: 950000,
    vacancyReserve: 0,
    tokentirrFee: 3450000,
    irr: 13720,
    roi: 8350,
    inversionAverageValue: 6280,
    annualGrossRents: 15600000,
    municipalTaxes: 1092000,
    homeownersInsurance: 0,
    propertyManagement: 900000,
    llcAndFilingFees: 500000,
    annualCashFlow: 9996000,
    monthlyCashFlow: 833000,
  },
  {
    id: uuidv4(),
    mainImage: 'Handem-av-117-main.jpg',
    street: '117 Handem Av',
    streetNumber: '117',
    description:
      'Vivienda multifamily situada en 117 Handem Av, esta completamente reformada, con una gran parcela y jardin. Tiene un historial de ocupación completo de 10 años sin incidencias ',
    images: ['DE6AA64D-1522-4BBD-AA48-5B5B1A1C3305_1_105_c.jpeg'],
    city: 'Waterbury',
    state: 'New Heaven',
    postalCode: '06704',
    tokenPrice: 1000,
    fiatTotalPrice: 124000000,
    availableTokens: 12400,
    totalTokens: 124000000 / 1000,
    closingCosts: 225000,
    companyIncorporationExpenses: 400000,
    initialMaintenanceReserve: 900000,
    vacancyReserve: 0,
    tokentirrFee: 3700000,
    irr: 14250,
    roi: 8800,
    inversionAverageValue: 6780,
    annualGrossRents: 17300000,
    municipalTaxes: 750000,
    homeownersInsurance: 0,
    propertyManagement: 800000,
    llcAndFilingFees: 600000,
    annualCashFlow: 10250000,
    monthlyCashFlow: 950000,
  },
  {
    id: uuidv4(),
    mainImage: 'Perkins-av-263-main.jpg',
    street: '263 Perkins Av',
    streetNumber: '263',
    description:
      'Vivienda multifamily situada en 263 Perkins Av,cuenta con cocina equipada y se encuentra en una de las zonas con mejor localización del estado ',
    images: ['EF7D57E6-60D5-4A14-B302-13ABB3D54452_1_105_c.jpeg'],
    city: 'Waterbury',
    state: 'New Heaven',
    postalCode: '06704',
    tokenPrice: 100000,
    fiatTotalPrice: 115000000,
    availableTokens: 1150,
    totalTokens: 115000000 / 100000,
    closingCosts: 195000,
    companyIncorporationExpenses: 370000,
    initialMaintenanceReserve: 950000,
    vacancyReserve: 0,
    tokentirrFee: 3450000,
    irr: 13750,
    roi: 9150,
    inversionAverageValue: 7100,
    annualGrossRents: 16175000,
    municipalTaxes: 750000,
    homeownersInsurance: 0,
    propertyManagement: 800000,
    llcAndFilingFees: 600000,
    annualCashFlow: 11250000,
    monthlyCashFlow: 1025000,
  },
  {
    id: uuidv4(),
    mainImage: 'main-st-1274-main.jpg',
    street: '219 S.Broad St',
    streetNumber: '219',
    description:
      'Vivienda multifamily situada en 219 S.Broad St,cuenta con dos plantas, separadas. La vievienda esta completamente amueblada y sus inquilinos llevan en ella desde el 2018 ',
    images: ['E7DCAC3F-5DD6-446D-8154-5587F06F4147_1_105_c.jpeg'],
    city: 'Meriden',
    state: 'New Heaven',
    postalCode: '06450',
    tokenPrice: 100000,
    fiatTotalPrice: 135000000,
    availableTokens: 1350,
    totalTokens: 135000000 / 100000,
    closingCosts: 200000,
    companyIncorporationExpenses: 400000,
    initialMaintenanceReserve: 875000,
    vacancyReserve: 0,
    tokentirrFee: 3600000,
    irr: 14900,
    roi: 9700,
    inversionAverageValue: 8000,
    annualGrossRents: 16775000,
    municipalTaxes: 750000,
    homeownersInsurance: 0,
    propertyManagement: 800000,
    llcAndFilingFees: 600000,
    annualCashFlow: 12250000,
    monthlyCashFlow: 1125000,
  },

  {
    id: uuidv4(),
    mainImage: 's-broad-st-219-main.jpg',
    street: '219 S.Broad St',
    streetNumber: '219',
    description:
      'Vivienda multifamily situada en 219 S.Broad St,cuenta con dos plantas, separadas. La vievienda esta completamente amueblada y sus inquilinos llevan en ella desde el 2018 ',
    images: ['D9E06DE2-AF1F-44DA-A658-F0ED5CF182F0.jpeg'],
    city: 'Wallingford',
    state: 'North Heaven',
    postalCode: '06492',
    tokenPrice: 100000,
    fiatTotalPrice: 142500000,
    availableTokens: 1425,
    totalTokens: 142500000 / 100000,
    closingCosts: 250000,
    companyIncorporationExpenses: 450000,
    initialMaintenanceReserve: 950000,
    vacancyReserve: 0,
    tokentirrFee: 3750000,
    irr: 13450,
    roi: 8900,
    inversionAverageValue: 8100,
    annualGrossRents: 15575000,
    municipalTaxes: 800000,
    homeownersInsurance: 0,
    propertyManagement: 850000,
    llcAndFilingFees: 650000,
    annualCashFlow: 13300000,
    monthlyCashFlow: 1050000,
  },
];
export { properties };
