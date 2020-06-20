const express = require('express');
require('./config/initialize-env');
require('./infra/mongo/connection');
const logger = require('./utils/logger');
const validateEnvironmentVariables = require('./config/validate-environment-values');
validateEnvironmentVariables();
const serverStartFallback = () => {
  logger.info('Server Started.');
};
const server = express();

server.listen(9003, serverStartFallback);
