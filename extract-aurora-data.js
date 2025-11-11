import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('/Users/sgunda/Downloads/KTLO AWS DB Version (Aurora) Deprecations.xlsx');

console.log('Sheet Names:', workbook.SheetNames);

const allEnvironments = [];

// Process all sheets
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Processing Sheet: ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Extract environment name from sheet name (e.g., "gwre-ccs-dev Nov 11" -> "dev")
  const envMatch = sheetName.match(/gwre-ccs-(\w+)/);
  const environment = envMatch ? envMatch[1] : sheetName;

  console.log(`Total Rows: ${data.length}`);

  if (data.length > 0) {
    // Parse the table structure - data is in pipe-separated format
    const parsed = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i][0];
      if (!row || typeof row !== 'string') continue;

      // Skip header rows and separators
      if (row.includes('AutoMinorVersionUpgrade') || row.match(/^\|[\s-]+\|/)) continue;

      // Parse pipe-separated values
      const parts = row.split('|').map(p => p.trim()).filter(p => p);

      if (parts.length >= 3) {
        parsed.push({
          environment: environment,
          autoMinorVersionUpgrade: parts[0] === 'True',
          dbInstanceIdentifier: parts[1],
          engineVersion: parts[2],
          compliant: false // We'll determine this based on version
        });
      }
    }

    console.log(`Parsed ${parsed.length} DB instances`);
    if (parsed.length > 0) {
      console.log('Sample:', JSON.stringify(parsed[0], null, 2));
    }

    allEnvironments.push(...parsed);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total DB Instances across all environments: ${allEnvironments.length}`);

// Analyze versions
const versions = {};
allEnvironments.forEach(db => {
  versions[db.engineVersion] = (versions[db.engineVersion] || 0) + 1;
});
console.log('\nVersion Distribution:');
console.log(versions);

// Count auto-upgrade status
const autoUpgradeEnabled = allEnvironments.filter(db => db.autoMinorVersionUpgrade).length;
console.log(`\nAuto Minor Upgrade: ${autoUpgradeEnabled}/${allEnvironments.length} enabled`);

// Save to JSON
fs.writeFileSync('./src/aurora-data.json', JSON.stringify(allEnvironments, null, 2));
console.log('\n✓ Data extracted successfully to src/aurora-data.json');
