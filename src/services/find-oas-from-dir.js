import path from 'path';
import * as fs from 'fs';

function isOas(filePath) {
  const fileString = fs.readFileSync(filePath, 'utf8')
  const oasRegEx = /^openapi/i
  return oasRegEx.test(fileString);
}

export default function findOasFromDir(startPath) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return [];
  }

  const files = fs.readdirSync(startPath);
  return files.reduce((acc, file) => {
    const filePath = path.join(startPath, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      return [...acc, ...findOasFromDir(filePath)]; //recurse
    } 
    if (file.endsWith('.yaml') && isOas(filePath)) {
      console.log('-- found: ', filePath);
      return [...acc, {
        filename: file,
        path: startPath
      }]
    }
    return []
  }, []);
};