# Setting Up Your Centre Dropdown

This guide shows you how to populate the centre dropdown menu from your Excel file.

## Step 1: Prepare Your Excel File

1. Save your Excel file as `centres.xlsx` in the project root directory
2. Make sure it has a column with the centre names

## Step 2: Configure the Script (if needed)

Edit `scripts/generate-centres.ts` if your Excel file structure is different:

```typescript
const SHEET_NAME = 'Sheet1'; // Your sheet name
const CENTRE_NAME_COLUMN = 'A'; // Column with centre names (A, B, C, etc.)
const START_ROW = 2; // Row where data starts (usually 2 if row 1 is headers)
```

## Step 3: Run the Generator

```bash
npm run generate-centres
```

This will:
- Read your Excel file
- Extract all centre names
- Generate dropdown code
- Save the code to `data/centres-dropdown.txt`
- Save a JSON list to `data/centres-list.json`

## Step 4: Copy the Dropdown Code

1. Open `data/centres-dropdown.txt`
2. Copy all the `<option>` tags
3. Open `app/page.tsx`
4. Replace lines 47-51 (the example centres) with your copied code

## Example Output

The script will generate code like:

```tsx
<option value="all">All Centres</option>
<option value="citycentrepool">City Centre Pool</option>
<option value="parksidecomplex">Parkside Complex</option>
<option value="eastsidefitness">Eastside Fitness</option>
...
```

## Centre ID Format

Centre names are automatically converted to IDs:
- "City Centre Pool" → `citycentrepool`
- "East-Side Fitness & Spa" → `eastsidefitnesspa`

These IDs must match the IDs you use in your knowledge base JSON!

## Troubleshooting

**Error: Excel file not found**
- Make sure `centres.xlsx` is in the project root directory
- Check the filename matches exactly

**Wrong centres extracted**
- Check `CENTRE_NAME_COLUMN` points to the correct column
- Check `START_ROW` is set correctly (usually row 2)
- Open `data/centres-list.json` to see what was extracted
