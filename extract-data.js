import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('/Users/sgunda/Downloads/KTLO Tracker.xlsx');

// Get first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Print structure
console.log('Total rows:', data.length);
console.log('\nColumn headers:');
if (data.length > 0) {
  console.log(Object.keys(data[0]));
}
console.log('\nFirst 3 rows:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

// Save to JSON file
fs.writeFileSync('./src/ktlo-data.json', JSON.stringify(data, null, 2));
console.log('\n✅ Data saved to src/ktlo-data.json');
