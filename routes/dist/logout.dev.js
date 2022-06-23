"use strict";

var express = require('express');

var pug = require('pug');

var fs = require('fs');

var path = require('path');

var connection = require('../db');

var device = require('express-device');

var router = express.Router(); // 이 라우터 모듈은 접속한 사용자가 desktop 유저인지 phone 유저인지를 비교하는 모듈을 사용함.

router.use(device.capture()); // pug 파일 동기적으로 로드.

var pugFile = fs.readFileSync(path.join(__dirname, "../views/login.pug"), 'utf8'); // 사용자에게 login.pug 파일을 보여준다.

router.get('/', function (req, res) {
  if (req.device.type == 'desktop') {
    req.session.login_id = undefined;
    req.session.login_usernum = undefined;
    req.session.admin = undefined;
    res.redirect('/auth/userlogin');
  } else if (req.device.type == 'phone') {
    if (req.query.sessionid) {
      var query = 'DELETE FROM SESSION WHERE SESSION_ID=?';
      var params = [req.query.sessionid];
      connection.query(query, params, function (err, rows) {
        if (err) console.log(err);
        res.json({});
      });
    }
  }
});
module.exports = router;