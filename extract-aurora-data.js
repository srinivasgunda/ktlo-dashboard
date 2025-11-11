import XLSX from 'xlsx';
import fs from 'fs';

const workbook = XLSX.readFile('/Users/sgunda/Downloads/KTLO AWS Minor DB Version (Aurora) Deprecations.xlsx');

console.log('Sheet Names:', workbook.SheetNames);

const allEnvironments = [];

// Helper function to convert Excel date number to date string
const excelDateToJSDate = (excelDate) => {
  if (!excelDate || typeof excelDate !== 'number') return 'Unknown';
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
};

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
    // Parse the table structure - data is in pipe-separated format in column 0
    // Owner is in column 7, EOL date is in column 6
    const parsed = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const pipeData = row[0];
      const eolDateExcel = row[6]; // Column 6 = End of Standard Support
      const ownerData = row[7];     // Column 7 = Owner

      if (!pipeData || typeof pipeData !== 'string') continue;

      // Skip header rows and separators
      if (pipeData.includes('AutoMinorVersionUpgrade') || pipeData.match(/^\|[\s-]+\|/)) continue;

      // Parse pipe-separated values
      const parts = pipeData.split('|').map(p => p.trim()).filter(p => p);

      if (parts.length >= 3) {
        const version = parts[2];
        const majorVersion = version.split('.')[0];
        const dbIdentifier = parts[1];

        // Get owner from column 7, fallback to extracting from identifier
        let owner = 'Unknown';
        if (ownerData && typeof ownerData === 'string' && ownerData.trim() !== '') {
          owner = ownerData.trim();
        } else {
          // Fallback: extract from instance identifier
          const ownerMatch = dbIdentifier.match(/^([^-]+)/);
          owner = ownerMatch ? ownerMatch[1] : 'Unknown';
        }

        // Get EOL date from column 6, fallback to hardcoded dates
        let eolDate = 'Unknown';
        if (eolDateExcel && typeof eolDateExcel === 'number') {
          eolDate = excelDateToJSDate(eolDateExcel);
        } else {
          // Fallback to PostgreSQL version EOL dates
          const eolDates = {
            '17': '2029-11-09',
            '16': '2028-11-09',
            '15': '2027-11-11',
            '14': '2026-11-12',
            '13': '2025-11-13',
            '12': '2024-11-14',
            '11': '2023-11-09',
          };
          eolDate = eolDates[majorVersion] || 'Unknown';
        }

        parsed.push({
          environment: environment,
          autoMinorVersionUpgrade: parts[0] === 'True',
          dbInstanceIdentifier: dbIdentifier,
          engineVersion: parts[2],
          owner: owner,
          endOfStandardSupport: eolDate,
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
