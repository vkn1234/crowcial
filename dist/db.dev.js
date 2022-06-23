"use strict";

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: '4team',
  password: 'gachon654321',
  database: '4team'
});
module.exports = db;