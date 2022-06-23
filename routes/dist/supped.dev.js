"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var pug = require('pug');

var connection = require('../db');

var router = express.Router();
var cryptoKey = "Crowcial만 알 수 있는 비밀 키";

var device = require('express-device'); //프로젝트 관리


router.post('/supped', function (req, res) {
  var sql1 = "select * from FUNDPROJECT AS F, PROJECT AS P, USER AS U  where F.PROJECT_NUM = P.PROJECT_NUM AND U.USER_NUM=F.USER_NUM  AND U.USER_ID =?;";
  var sql2 = "select * from PROJECT AS P, LIKEPROJECT AS L, USER AS U where P.PROJECT_NUM = L.PROJECT_NUM AND L.USER_NUM = U.USER_NUM AND U.USER_ID = ?";
  var sql3 = "Select * From PROJECT Where PROJECT_STATE= ?  AND PROJECT_USERNUM = ?"; //진행

  var sql4 = "Select * From PROJECT Where PROJECT_STATE= ?  AND PROJECT_USERNUM = ?"; //

  var param = req.session.login_id;
  var param2 = req.session.login_usernum;
  var param3 = [0, req.session.login_usernum];
  var param4 = [1, req.session.login_usernum];
  console.log(param);
  connection.query(sql1, param, function (error, results1, fields) {
    console.log(results1);
    connection.query(sql2, param, function (error, results2, fields) {
      connection.query(sql3, param3, function (error, results3, fields) {
        connection.query(sql4, param4, function (error, results4, fields) {
          console.log(results1);
          console.log(results2);
          res.render('supped.pug', {
            goods1: results1,
            goods2: results2,
            goods3: results3,
            goods4: results4
          });

          if (error) {
            console.log(error);
            res.status(500).send('sql2 Error');
          }
        });

        if (error) {
          console.log(error);
          res.status(500).send('sql2 Error');
        }
      });

      if (error) {
        console.log(error);
        res.status(500).send('sql2 Error');
      }
    });

    if (error) {
      console.log(results1);
      console.log(error);
      res.status(500).send('sql1 Error');
    }
  });
});
router.get('/supped', function (req, res) {
  var sql1 = "select * from FUNDPROJECT AS F, PROJECT AS P, USER AS U  where F.PROJECT_NUM = P.PROJECT_NUM AND U.USER_NUM=F.USER_NUM  AND U.USER_ID =?;";
  var sql2 = "select * from PROJECT AS P, LIKEPROJECT AS L, USER AS U where P.PROJECT_NUM = L.PROJECT_NUM AND L.USER_NUM = U.USER_NUM AND U.USER_ID = ?";
  var sql3 = "Select * From PROJECT Where PROJECT_STATE= ?  AND PROJECT_USERNUM = ?"; //진행

  var sql4 = "Select * From PROJECT Where PROJECT_STATE= ?  AND PROJECT_USERNUM = ?"; //

  var param = req.session.login_id;
  var param2 = [0, req.session.login_usernum];
  var param3 = [1, req.session.login_usernum];
  console.log(param);
  connection.query(sql1, param, function (error, results1, fields) {
    console.log(results1);
    connection.query(sql2, param, function (error, results2, fields) {
      connection.query(sql3, param2, function (error, results3, fields) {
        connection.query(sql4, param3, function (error, results4, fields) {
          console.log(results1);
          console.log(results2);
          res.render('supped.pug', {
            goods1: results1,
            goods2: results2,
            goods3: results3,
            goods4: results4
          });

          if (error) {
            console.log(error);
            res.status(500).send('sql2 Error');
          }
        });

        if (error) {
          console.log(error);
          res.status(500).send('sql2 Error');
        }
      });

      if (error) {
        console.log(error);
        res.status(500).send('sql2 Error');
      }
    });

    if (error) {
      console.log(results1);
      console.log(error);
      res.status(500).send('sql1 Error');
    }
  });
});
module.exports = router;