"use strict";

var express = require('express');

var router = express.Router();

var connection = require('../db'); //mysql 모듈을 로딩.


var pug = require('pug');

var fs = require('fs');

var bodyParser = require('body-parser');

var path = require('path');

var formidable = require('formidable');

var e = require('express');
/*
var target = document.getElementById("sort");
var category=target.options[target.selectedIndex].value;
*/


router.use(bodyParser.urlencoded({
  extended: false
}));
var pugFile = fs.readFileSync(path.join(__dirname, "../views/list.pug"), 'utf8'); // 사용자에게 list.pug 파일을 보여준다.

router.get('/', function (req, res) {
  var order = 'num';

  try {
    if (req.query.order == 'num') {
      order = 'num';
    } else if (req.query.order == 'likeit') {
      order = 'like';
    } else if (req.query.order == 'category') {
      order = 'sort';
    }

    var sql = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY p.project_" + order + " DESC";
    connection.query(sql, function (err, rows) {
      var order = '최신순';

      if (req.query.order == 'num') {
        order = '최신순';
      } else if (req.query.order == 'likeit') {
        order = '좋아요순';
      } else if (req.query.order == 'category') {
        order = '카테고리별';
      }

      res.render('list.pug', {
        rows: rows,
        order: order
      });
    });
  } catch (error) {
    console.log(error);
  }
}); //좋아요

router.post('/:id/like', function (req, res) {
  var projectnum = req.params.id;
  var id = req.session.login_usernum;
  console.log("좋아요 시도");
  var query = "SELECT * FROM LIKEPROJECT AS L, USER AS U WHERE U.USER_NUM=L.USER_NUM AND U.USER_NUM = ? AND L.PROJECT_NUM=?";
  var params = [id, projectnum];
  var form = new formidable.IncomingForm();

  try {
    connection.query(query, params, function (err, rows) {
      if (!rows.length > 0) {
        // 사용자가 좋아요를 아직 누르지 않은 경우
        console.log("좋아요");
        var query = "INSERT INTO LIKEPROJECT VALUES (?, ?)";
        var params = [id, projectnum];
        console.log("id  : ", id);
        console.log("projectnum : ", projectnum); // 사용자가 해당 프로젝트에 좋아요를 했음을 나타내기 위해 LIKEPROJECT에 인서트.

        var query = "UPDATE PROJECT SET PROJECT_LIKE=PROJECT_LIKE+1 WHERE PROJECT_NUM=?";
        var params = [projectnum];
        connection.query(query, params, function (err, rows) {
          // 해당 프로젝트의 좋아요
          console.log(rows);
        });
      } else {
        console.log("좋아요 취소");
        projectnum = req.params.id;
        id = req.session.login_usernum;
        var query1 = "DELETE FROM LIKEPROJECT WHERE USER_NUM=? AND PROJECT_NUM=?";
        var query2 = "UPDATE PROJECT SET PROJECT_LIKE = PROJECT_LIKE-1 WHERE PROJECT_NUM =?";
        var param1 = [id, projectnum];
        var param2 = [projectnum];
      }

      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error);
  }
}); //후원

router.post('/:id/support', function (req, res) {
  console.log("후원 시도");
  projectnum = req.params.id;
  id = req.session.login_usernum;
  money = req.body.money;
  console.log("후원 금액 : ", money);
  console.log("프로젝트 번호 : ", projectnum);
  var connectionsql1 = "INSERT INTO FUNDPROJECT(USER_NUM,PROJECT_NUM,FUND_DATE,FUND_MONEY) VALUES(?,?,now(),?)"; // fundproject에 후원 내역 등록

  var connectionsql2 = "UPDATE PROJECT SET PROJECT_MONEY = PROJECT_MONEY+? WHERE PROJECT_NUM =?"; // project에 등록금액 갱신

  var connectionsql3 = "SELECT USER_NOW FROM USERMONEY WHERE USER_NUM=?"; // 유저의 보유금액

  var connectionsql4 = "UPDATE USERMONEY SET USER_NOW = USER_NOW - ?,USER_PSEND=USER_PSEND+? WHERE USER_NUM=?"; // 유저 보유금액 감소 및 후원한 총 금액 업데이트

  param1 = [id, projectnum, money];
  param2 = [money, projectnum];
  param3 = [money, money, id];
  connection.query(DBsql3, id, function (error, rows, fiels) {
    usermoney = rows[0].USER_NOW;
    console.log("유저 보유 금액", usermoney); //후원하고자 하는 금약아 보유한 금액보다 많은지 비교

    if (usermoney < money) {
      console.log("후원할 금액 초과");
      var sql1 = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY P.PROJECT_NUM DESC";
      var sql2 = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY P.PROJECT_LIKE DESC";
      var sql3 = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY P.PROJECT_SORT";
      console.log(req.params.order);
      res.redirect('list.pug');
    } else {
      connection.query(DBsql1, param1, function (error, results1, fields) {
        connection.query(DBsql2, param2, function (error, results2, fields) {
          connection.query(DBsql4, param3, function (error, results, fields) {
            var sql1 = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY P.PROJECT_NUM DESC";
            var sql2 = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY P.PROJECT_LIKE DESC";
            var sql3 = "SELECT * FROM PROJECT P, USER U WHERE P.PROJECT_USERNUM=U.USER_NUM ORDER BY P.PROJECT_SORT";
            console.log(req.params.order);
            res.render('list.pug');
          });
        });
      });
    }
  });
});
module.exports = router;