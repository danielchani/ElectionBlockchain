const fs = require('fs');
const path = './data/';

const files = {
  'candidates.json': {},
  'voters.json': {},
  'results.json': []
};

if (!fs.existsSync(path)) fs.mkdirSync(path);

for (const [filename, content] of Object.entries(files)) {
  const fullPath = path + filename;
  fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
  console.log(`V Created: ${fullPath}`);
}
