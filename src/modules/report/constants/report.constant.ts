export const GlAccountIncomeURL = 'https://api.buildium.com/v1/glaccounts?accounttypes=income&limit=1000';
export const GlAccountExpenseURL = 'https://api.buildium.com/v1/glaccounts?accounttypes=expense&limit=1000';
export const GlAccountReserveURL = 'https://api.buildium.com/v1/glaccounts?accounttypes=asset';

export const OneBudgetURL = 'https://api.buildium.com/v1/budgets/'; // this budget is aginst one budget id
export const PropertyBudgetURL = 'https://api.buildium.com/v1/budgets?propertyids=';
// export const GeneralLedgerURL = 'https://api.buildium.com/v1/generalledger/transactions?startdate=2023-01-01&enddate=2023-06-30&glaccountids=40085, 40086, 40087, 40088, 40089, 40090, 40091, 40092, 40093, 40094, 40095, 40099, 40100, 40101, 40102, 40103, 40104, 40105, 40106, 40107, 40108, 40109, 40110, 40111, 40112, 40113, 40114, 40115, 98394, 103838, 104420, 104421, 105924, 106742, 109188, 111936, 114911, 120792, 123987, 124509, 130196, 132079, 135538&selectionentityid=15192&selectionentitytype=Association&limit=10000'
// export const GeneralLedgerURL = 'https://api.buildium.com/v1/generalledger/transactions?startdate=2023-01-01&enddate=2023-06-30&selectionentityid=15192&selectionentitytype=Association&limit=10000&glaccountids='
export const GeneralLedgerURL = 'https://api.buildium.com/v1/generalledger/transactions?selectionentitytype=Association&limit=1000&offset=';