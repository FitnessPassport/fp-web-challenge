/**
 * Script to transform facilities.json into normalized database fixture files
 * Run with: node scripts/generate-fixtures.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read original facilities.json
const facilitiesData = JSON.parse(
  readFileSync(join(projectRoot, 'assets', 'facilities.json'), 'utf-8')
);

// Parse address string into components
function parseAddress(addressString) {
  try {
    const parts = addressString.split(',').map((part) => part.trim());
    
    if (parts.length < 3) {
      return {
        address1: addressString,
        address2: null,
        suburb: '',
        state: '',
        postCode: '',
      };
    }

    const address1 = parts[0];
    const suburb = parts[1];
    const statePostCode = parts[2].split(' ').filter((s) => s.length > 0);
    
    if (statePostCode.length < 2) {
      return {
        address1,
        address2: null,
        suburb,
        state: '',
        postCode: '',
      };
    }

    const postCode = statePostCode[statePostCode.length - 1];
    const state = statePostCode.slice(0, -1).join(' ');

    return {
      address1,
      address2: null,
      suburb,
      state,
      postCode,
    };
  } catch (error) {
    return {
      address1: addressString,
      address2: null,
      suburb: '',
      state: '',
      postCode: '',
    };
  }
}

// Transform into facilities table structure
const facilities = facilitiesData.map((raw) => {
  const parsed = parseAddress(raw.address);
  const now = new Date().toISOString();
  
  return {
    id: raw.id,
    name: raw.name,
    address1: parsed.address1,
    address2: parsed.address2,
    suburb: parsed.suburb,
    state: parsed.state,
    postCode: parsed.postCode,
    country: 'Australia',
    latitude: raw.location.latitude,
    longitude: raw.location.longitude,
    createdAt: now,
    updatedAt: now,
  };
});

// Transform into facility_amenities table structure
// Normalize amenities to lowercase for case-insensitive searching
const facilityAmenities = [];
facilitiesData.forEach((raw) => {
  raw.facilities.forEach((amenity) => {
    facilityAmenities.push({
      facilityId: raw.id,
      amenity: amenity.toLowerCase(),
    });
  });
});

// Create fixtures directory if it doesn't exist
mkdirSync(join(projectRoot, 'src', 'fixtures'), { recursive: true });

// Write fixture files
writeFileSync(
  join(projectRoot, 'src', 'fixtures', 'facilities.json'),
  JSON.stringify(facilities, null, 2),
  'utf-8'
);

writeFileSync(
  join(projectRoot, 'src', 'fixtures', 'facility-amenities.json'),
  JSON.stringify(facilityAmenities, null, 2),
  'utf-8'
);

console.log('✅ Generated fixture files:');
console.log(`   - src/fixtures/facilities.json (${facilities.length} facilities)`);
console.log(`   - src/fixtures/facility-amenities.json (${facilityAmenities.length} amenities)`);

