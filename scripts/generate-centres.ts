import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Configuration: Adjust these based on your Excel file
const EXCEL_FILE = 'centres.xlsx'; // Place your Excel file in the project root
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name
const CENTRE_NAME_COLUMN = 'A'; // Column containing centre names (A, B, C, etc.)
const ADDRESS_COLUMN = 'B'; // Column containing addresses
const STATE_COLUMN = 'C'; // Column containing state
const START_ROW = 2; // Row where data starts (skip header)

function generateCentreId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '') // Remove spaces
    .trim();
}

async function generateCentres() {
  console.log('Reading Excel file...\n');

  const excelPath = path.join(process.cwd(), EXCEL_FILE);

  if (!fs.existsSync(excelPath)) {
    console.error(`Error: Excel file not found at ${excelPath}`);
    console.log('\nPlease place your centres.xlsx file in the project root directory.');
    return;
  }

  // Read the Excel file
  const workbook = XLSX.readFile(excelPath);
  const sheetName = SHEET_NAME in workbook.Sheets ? SHEET_NAME : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Get the range of the worksheet
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const centres: Array<{ id: string; name: string; state: string }> = [];

  // Extract centre names and states
  for (let row = START_ROW - 1; row <= range.e.r; row++) {
    const nameCell = worksheet[CENTRE_NAME_COLUMN + (row + 1)];
    const stateCell = worksheet[STATE_COLUMN + (row + 1)];

    if (nameCell && nameCell.v) {
      const centreName = String(nameCell.v).trim();
      const state = stateCell && stateCell.v ? String(stateCell.v).trim() : 'Unknown';

      if (centreName) {
        centres.push({
          id: generateCentreId(centreName),
          name: centreName,
          state: state,
        });
      }
    }
  }

  console.log(`Found ${centres.length} centres\n`);

  // Generate TypeScript/JSX code for dropdown options
  const dropdownOptions = centres
    .map((centre) => `            <option value="${centre.id}">${centre.name}</option>`)
    .join('\n');

  const output = `
Copy and paste these lines into app/page.tsx (replace the example centres):

            <option value="all">All Centres</option>
${dropdownOptions}
`;

  console.log(output);

  // Save to a file for reference
  const outputPath = path.join(process.cwd(), 'data', 'centres-dropdown.txt');
  fs.writeFileSync(outputPath, output);
  console.log(`\nDropdown code saved to: ${outputPath}`);

  // Also generate a JSON file with the centres list
  const centresJsonPath = path.join(process.cwd(), 'data', 'centres-list.json');
  fs.writeFileSync(centresJsonPath, JSON.stringify(centres, null, 2));
  console.log(`Centres list saved to: ${centresJsonPath}`);
}

generateCentres().catch(console.error);
