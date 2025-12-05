const fs = require('fs');
const path = require('path');
const swaggerSpec = require(path.join(__dirname, '..', 'config', 'swagger'));

const outPath = path.join(__dirname, '..', 'docs', 'swagger.json');
fs.writeFileSync(outPath, JSON.stringify(swaggerSpec, null, 2));
console.log('Wrote swagger spec to', outPath);
