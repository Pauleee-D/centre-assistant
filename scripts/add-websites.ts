import * as fs from 'fs';
import * as path from 'path';

const mdPath = path.join(process.cwd(), 'data', 'knowledge-base-clean.md');
let markdown = fs.readFileSync(mdPath, 'utf-8');

// Map of centre names to their websites
const websites: Record<string, string> = {
  'Ascot Vale': 'https://www.movemv.com.au/ascot-vale-leisure-centre/',
  'Auburn Ruth': 'https://www.auburnaquaticcentre.com.au/',
  'Bathurst (Manning)': 'https://www.bathurstaquatic.com.au/',
  'Bright': 'https://www.brightsportscentre.com.au/',
  'Burpengary': 'https://www.burpengaryralc.com.au/',
  'Canberra Olympic Pool': 'https://www.canberraolympicpool.com.au/',
  'Chinchilla': 'https://chinchillaaquaticandfitnesscentre.com.au/',
  'Civic Reserve': 'https://www.civicreccentre.com.au/',
  'Dalby Aquatic Centre': 'https://dalbyaquaticcentre.com.au/',
  'Danny Frawley': 'https://www.dannyfrawleycentre.com.au/',
  'Dickson Pools': 'https://www.dicksonpool.com.au/',
  'East Fremantle': 'https://bactiveeastfremantle.com.au/',
  'Erindale': 'https://erindaleleisurecentre.com.au/',
  'Ferny Hill Swimming Pool': 'https://www.fernyhillspool.com.au/',
  'Great Lakes': 'https://greatlakesalc.com.au/',
  'Gungahlin': 'https://www.gungahlinleisurecentre.com.au/',
  'Gurri Wanyarra': 'https://www.gurriwanyarrawc.com.au/',
  'Gympie': 'https://www.gympiearc.com.au/',
  'Jack Hort': 'https://www.jackhortmcp.com.au/',
  'Keilor East Leisure Centre': 'https://www.movemv.com.au/keilor-east-leisure-centre/',
  'Knox Leisureworks': 'https://www.knoxleisureworks.com.au/',
  'Kurri Kurri': 'https://www.kurrikurriafc.com.au/',
  'Lakeside': 'https://www.lakesideleisure.com.au/',
  'Loftus': 'https://www.loftusrecreationcentre.com.au/',
  'Mansfield Swimming Pool': 'https://www.mansfieldswimmingpool.com.au/',
  'Michael Clarke': 'https://www.michaelclarkecentre.com.au/',
  'Michael Wenden': 'https://www.wendenpool.com.au/',
  'Mill Park': 'https://www.millparkleisure.com.au/',
  'Monbulk': 'https://www.monbulkaquatic.com.au/',
  'Moree': 'https://www.moreeartesianaquaticcentre.com.au/',
  'Pelican Park': 'https://www.pelicanparkrec.com.au/',
  'Portland': 'https://www.portlandleisurecentre.com.au/',
  'Queens Park Pool': 'https://www.movemv.com.au/queens-park-swimming-pool/',
  'SWELL': 'https://www.swellpalmerston.com.au/',
  'SWIRL': 'https://www.swirltas.com.au/',
  'Summit': 'https://summitaquaticleisure.com.au/',
  'Swan Hill': 'https://www.swanhilllc.com.au/',
  'TRAC': 'https://www.trac.com.au/',
  'Te Hiku': 'https://tehikusportshub.co.nz/',
  'Tomaree': 'https://www.tomareeac.com.au/',
  'WaterMarc': 'https://www.watermarcbanyule.com.au/',
  'Whittlesea Swim Centre': 'https://www.watermarcbanyule.com.au/',
  'Wollondilly': 'https://www.wclc.com.au/',
  'Wulanda': 'https://www.wulanda.com.au/',
  'YAWA': 'https://www.yawa.com.au/',
  'Yarra': 'https://www.yarracentre.com.au/',
};

let updatedCount = 0;

// Process each centre
for (const [centreName, websiteUrl] of Object.entries(websites)) {
  // Find the Contact Information section for this centre
  const centrePattern = new RegExp(`(## ${centreName}\\s+### Contact Information\\s+${centreName} Contact Information:)`, 'g');

  if (markdown.match(centrePattern)) {
    // Add website URL right after the Contact Information label
    const replacement = `$1 Website ${websiteUrl}`;
    markdown = markdown.replace(centrePattern, replacement);
    console.log(`✓ Added website for ${centreName}`);
    updatedCount++;
  } else {
    console.log(`✗ Could not find Contact Information section for ${centreName}`);
  }
}

// Write the updated markdown back to file
fs.writeFileSync(mdPath, markdown, 'utf-8');

console.log(`\nDone! Updated ${updatedCount} centres with website URLs.`);
