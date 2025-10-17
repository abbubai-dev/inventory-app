# Inventory App - Ready Starter (React + Tailwind + ZXing scanner + Recharts + Google Sheets)

## Quick start
1. Unzip the project and `cd inventory-app`
2. Run `npm install`
3. Run `npm start`
4. Open http://localhost:3000

## Notes
- The app calls your Google Apps Script endpoints:
  - Get items: `GET {API_URL}?action=getItems`
  - Get transactions: `GET {API_URL}?action=getTransactions`
  - Post actions: `POST {API_URL}` with JSON body (action: stockIn/stockOut/defect)
- If you deploy the frontend, ensure the Apps Script deployment allows access from that domain or is "Anyone".