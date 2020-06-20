const chalk = require('chalk');

const envError = missingEnv => {
  console.log(
    chalk.red(`The ${missingEnv} environment variable value is missing.`)
  );
};

const missingEnvError = () => {
  console.log(
    chalk.yellow(
      "Exiting server as one or more envirnment variable's values are missing."
    )
  );
};

const logEnvValuesAfterInitialization = () => {
  console.log(chalk.blue('Environment variables and values set:'));
  Object.keys(process.env)
    .filter(key => /^APP/.test(key))
    .forEach(key => {
      console.log(chalk.green(`${key}: ${process.env[key]}`));
    });
};

const info = msg => {
  console.log(chalk.yellow(msg));
};

const error = msg => {
  console.log(chalk.red(msg));
};

module.exports = {
  envError,
  missingEnvError,
  logEnvValuesAfterInitialization,
  info,
  error
};
