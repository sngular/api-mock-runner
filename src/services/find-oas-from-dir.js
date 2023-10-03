import path from 'path';
import * as fs from 'fs';

export default function fromDir(startPath) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return [];
  }

  const files = fs.readdirSync(startPath);
  return files.reduce((acc, file) => {
    const filename = path.join(startPath, file);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      return [...acc, ...fromDir(filename)]; //recurse
  } else if (filename.endsWith('.yaml')) {
      console.log('-- found: ', filename);
      return [...acc, {
        filename: file,
        path: startPath
      }]
  };
  }, []);
};