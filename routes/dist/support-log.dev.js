"use strict";

var express = require('express');

var connection = require('../db');

var pug = require('pug');

var fs = require('fs');

var path = require('path');

var router = express.Router();
var cryptoKey = "Crowcial만 알 수 있는 비밀 키"; // pug 파일 비동기적으로 로드.

var pugFile = fs.readFileSync(path.join(__dirname, "../views/support-log.pug"), 'utf8'); // 사용자에게 pug 파일을 보여준다.

router.get('/', function (req, res) {
  if (req.session.admin) {
    var query = 'SELECT FUND_NUM, USER_NAME, USER_ID, PROJECT_NAME, F.PROJECT_NUM, FUND_DATE, FUND_MONEY ';
    query += 'FROM FUNDPROJECT AS F, USER AS U, PROJECT AS P ';
    query += 'WHERE F.USER_NUM=U.USER_NUM AND F.PROJECT_NUM=P.PROJECT_NUM ';
    connection.query(query, function (err, rows) {
      res.status(200).send(pug.render(pugFile, {
        rows: rows
      }));
    });
  }
});
module.exports = router;