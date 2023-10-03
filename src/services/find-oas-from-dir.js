import path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

async function getFirstLine(filePath) {
  const readable = fs.createReadStream(filePath);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();
  return line;
}

async function isOas(filePath) {
  const firstLine = await getFirstLine(filePath)
  const oasRegEx = /^openapi/i
  return oasRegEx.test(firstLine);
}

export default async function findOasFromDir(startPath) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return [];
  }

  const files = fs.readdirSync(startPath);
  return files.reduce(async (acc, file) => {
    const filePath = path.join(startPath, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      return [...(await acc), ...(await findOasFromDir(filePath))];
    } 
    if (file.endsWith('.yaml') && (await isOas(filePath))) {
      return [...(await acc), {
        filename: file,
        path: startPath,
        filePath,
      }]
    }
    return []
  }, []);
};