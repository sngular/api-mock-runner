import path from 'path';
import * as fs from 'fs';
import nReadlines from 'n-readlines'

function isOas(filePath) {
  const line = new nReadlines(filePath);
  const firstLine = line.next().toString();
  const oasRegEx = /^openapi/i
  return oasRegEx.test(firstLine);
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
      return [...acc, ...findOasFromDir(filePath)];
    } 
    if (file.endsWith('.yaml') && isOas(filePath)) {
      console.log('-- found: ', filePath);
      return [...acc, {
        filename: file,
        path: startPath,
        filePath,
      }]
    }
    return []
  }, []);
};