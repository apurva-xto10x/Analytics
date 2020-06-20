const REQUIRED_ENVS = require('./required.env');
const logger = require('../utils/logger');

module.exports = () => {
  let isMissingEnvironmentValues = [];
  REQUIRED_ENVS.forEach(env => {
    if (!process.env[env]) {
      isMissingEnvironmentValues.push(env);
      logger.envError(env);
    }
  });
  if (isMissingEnvironmentValues.length) {
    if (
      isMissingEnvironmentValues.length === 1 &&
      isMissingEnvironmentValues.includes('NODE_ENV')
    ) {
      process.env.NODE_ENV = 'development';
      logger.info('Initializing NODE_ENV to default, i.e., development');
      return;
    }
    if (isMissingEnvironmentValues) logger.missingEnvError();
    process.exit(1);
  }
};
