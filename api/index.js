const serverless = require('serverless-http');
require('dotenv').config();
const connectDB = require('../config/database');
const app = require('../index');

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection error', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, message: 'Database connection error' }));
    return;
  }

  return handler(req, res);
};
