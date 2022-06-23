"use strict";

var express = require('express');

var router = express.Router();

var connection = require('../db'); //mysql 모듈을 로딩.


var pug = require('pug');

var fs = require('fs');

var formidable = require('formidable'); // 이 라우터 모듈은 req 객체를 파싱하는데 formidable 모듈을 사용함.


var path = require('path'); // pug 파일 비동기적으로 로드.


var pugFile = fs.readFileSync(path.join(__dirname, "../views/insert.pug"), 'utf8');
router.get('/', function (req, res) {
  res.render('insert.pug');
  /*connection.getConnection(function (err, connection) {
      var sql = "";
          if (req.body.writer) {
              sql = "UPDATE PROJECT " +
                  "SET PROJECT_USERNUM=?, PROJECT_SORT=?, PROJECT_TITLE=?, PROJECT_CONTENT=?, PROJECT_DUE=?, PROJECT_DUEMONEY FROM PROJECT";
          } else {
          sql = "INSERT INTO PROJECT(PROJECT_TITLE, PROJECT_SORT, PROJECT_CONTENT, PROJECT_USERNUM, PROJECT_DUE, PROJECT_DUEMONEY) VALUES(?,?,?,?,?,?)";
      }
      connection.query(sql, data, function (err, rows) {
          if (err) console.error("err : " + err);
            res.redirect('/board1/list');
          connection.release();
      });
  });*/
});
router.post('/', function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, "../public/images/projects");
  form.parse(req, function (err, body, files) {
    var file = files.image; // input(type="file", name="image")에서 보내온 파일
    // 파일 이름을 현재시간.jpg 로 변경

    var date = Date.now();
    var newPath = form.uploadDir + "/" + date + path.extname(file.name);
    fs.rename(file.path, newPath, function (err) {
      console.log("파일명 변경!");
    }); // 프로젝트 DB에 인서트.

    console.log(body);
    var query = 'INSERT INTO PROJECT(PROJECT_NUM, PROJECT_SORT, PROJECT_NAME, ';
    query += 'PROJECT_CONTENT, PROJECT_USERNUM, PROJECT_DATE, PROJECT_DUE, ';
    query += 'PROJECT_MONEY, PROJECT_DUEMONEY, PROJECT_STATE, PROJECT_SPEND_FILE, ';
    query += 'PROJECT_IMAGE, PROJECT_LIKE) VALUES(0, ?, ?, ?, ?, NOW(), ?, 0, ?, 0, 0, ?, 0)';
    var params = [body.category, body.title, body.content, req.session.login_usernum, body.deadline, body.duemoney, date];
    connection.query(query, params, function (err, rows) {
      if (err) console.log(err);
      res.redirect("/project/list");
    });
  });
  /*var params = [req.body.title, req.body.category, req.body.content, req.session.login_usernum, req.body.deadline, req.body.duemoney, req.body.image];
  console.log(params);
  var sql = "INSERT INTO PROJECT(PROJECT_NAME, PROJECT_SORT, PROJECT_CONTENT, PROJECT_USERNUM, PROJECT_DUE, PROJECT_DUEMONEY, PROJECT_IMAGE";
  sql+=", PROJECT_DATE, PROJECT_MONEY, PROJECT_LIKE) VALUES(?,?,?,?,?,?,?,now(),0,0)";
  connection.query(sql, params, function (err, rows) {
      var sql2="INSERT INTO HEART(LIKE_COUNT)";
      connection.query(sql2,0, function (err) {
          res.redirect("/project/list");
      })
  });*/
});
module.exports = router;