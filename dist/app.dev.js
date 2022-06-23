"use strict";

var express = require('express');

var connection = require('./db');

var fs = require('fs');

var pug = require('pug');

var ejs = require('ejs');

var session = require('express-session');

var app = express();

var crypto = require('crypto');

var _require = require('assert'),
    ifError = _require.ifError;

connection.query('DELETE FROM SESSION WHERE LOGIN_ID IS NULL', function (err, rows) {
  app.locals.pretty = true;
  app.set('view engine', 'pug');
  app.set('views', './views');
  app.use(express["static"]('public'));
  app.use(express.json());
  app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true
  }));
  app.get('/', function (req, res) {
    res.redirect('/auth/userlogin');
  });
  app.get('/androidtest', function (req, res) {
    console.log("GET /androidtest");
  });
  app.use('/android/project', require('./routes/android_project'));
  app.use('/android/user', require('./routes/android_user'));
  app.use('/phone/session', require('./routes/phonesession'));
  app.use('/auth/userwithdrawl', require('./routes/userwithdrawl'));
  app.use('/auth/userlogin', require('./routes/login'));
  app.use('/auth/userlogout', require('./routes/logout'));
  app.use('/auth/adminlogin', require('./routes/adminlogin'));
  app.use('/auth/adminlogout', require('./routes/adminlogout'));
  app.use('/auth/register', require('./routes/register'));
  app.use('/auth/user/search', require('./routes/usersearch'));
  app.use('/project/support/log', require('./routes/support-log'));
  app.use('/project/manager', require('./routes/adminproject')); // app.use('/project/supped', require('./routes/supped'));

  app.use('/auth/user', require('./routes/user'));
  app.use('/project/manager/CompleteList', require('./routes/completeproject'));
  app.use('/project/user/display', require('./routes/display'));
  app.use('/project/list', require('./routes/list'));
  app.use('/project/revising', require('./routes/revising'));
  app.use('/auth/usercompleteproject', require('./routes/usercompleteproject')); // app.use('/project/list/category', require('./routes/list'));

  app.use('/project/insert', require('./routes/insert')); // app.use('/project/nav', require('.routes/includeHTML'));

  app.listen(65004, function (error) {
    console.log('65004번 포트로 크라우드펀딩 서버 실행!');

    if (error) {
      console.log(error);
    }
  });
});
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'abcdefghijklmnop'.repeat(2); // Must be 256 bits (32 characters)

var IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  var iv = '1234567890123456';
  var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  var encrypted = cipher.update(text);
  encrypted += cipher["final"]('hex');
  return encrypted;
}