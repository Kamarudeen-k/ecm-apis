require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  test: {
    username: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASS,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: 'be6e33a531b29f',
    password: 'f394e2cb',
    database: 'heroku_062ab2182533991',
    host: 'us-cdbr-iron-east-02.cleardb.net',
    dialect: 'mysql',
    logging: false,
  },
  fb_client_app_id : "2184328495028265",
  fb_client_app_secret: "928c57167d43e15ebaf89956cf389a1b"
};
