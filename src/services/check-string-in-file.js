import * as fs from 'fs';
import * as readline from 'readline';

export default async function(stringToCheck, filePath) {
  const reader = readline.createInterface({ input: fs.createReadStream(filePath) });
  let exists = false;

  for await (const line of reader) {
    if(line===stringToCheck) {
      exists = line===stringToCheck
      break;
    }
  }

  return exists;
}