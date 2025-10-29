import fs from 'fs';
import path from 'path';

// Read the db.json file
const dbPath = path.join(process.cwd(), 'db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Export the database object
export const db = {
  inventory: dbData.inventory || [],
  stockMovements: dbData.stockMovements || [],
  // Add other collections as needed
};
