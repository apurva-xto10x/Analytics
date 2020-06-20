const CONFIG = require('../../config/keys');
const logger = require('../../utils/logger');
const {
  MONGO_DB_HOST: DB_HOST,
  MONGO_DB_USERNAME: DB_USERNAME,
  MONGO_DB_PASSWORD: DB_PASSWORD,
  MONGO_DB_DBNAME: DB_NAME
} = CONFIG;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.connect(err => {
  if (!err) logger.info('Mongo connection established.');
  else {
    logger.error(
      'Error occured while trying to eastablish connection with mongo: ',
      err
    );
  }
});

module.exports = client;
