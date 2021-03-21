const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'react-write',
    host: '127.0.0.1',
    port: '3010',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'react-write',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: process.env.HEROKU_USERNAME,
    password: process.env.HEROKU_PASSWORD,
    database: process.env.HEROKU_DBNAME,
    host: process.env.HEROKU_HOST,
    dialect: 'mysql',
  },
};
