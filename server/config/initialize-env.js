const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const logger = require('../utils/logger');

const resolveFilePath = filename => {
  return path.resolve(__dirname, `../${filename}`);
};
const filePath = [resolveFilePath('.env')];

switch (process.env.NODE_ENV) {
  case 'production':
    filePath.push(resolveFilePath('.env.production'));
    break;
  default:
    filePath.push(resolveFilePath('.env.development'));
    break;
}

filePath.map(envFile => {
  if (fs.existsSync) {
    dotenvExpand(
      dotenv.config({
        path: envFile
      })
    );
  }
});

logger.logEnvValuesAfterInitialization();
