const { parseBankStatement } = require('./src/services/statementParserService');
const text = `Date	Description	Debit (■)	Credit (■)	Balance (■)
01/09/2026	SALARY CREDIT / DEMO COMPANY		50,000.00	50,000.00
02/09/2026	SWIGGY FOOD ORDER	450.00		49,550.00
03/09/2026	UBER INDIA TRIP	320.00		49,230.00
04/09/2026	NETFLIX.COM SUBSCRIPTION	649.00		48,581.00
05/09/2026	AMAZON INDIA	2,300.00		46,281.00
06/09/2026	RENT PAYMENT	15,000.00		31,281.00`;
console.log(JSON.stringify(parseBankStatement(text), null, 2));
