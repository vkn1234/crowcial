"use strict";

var express = require('express');

var router = express.Router();

var connection = require('../db'); //mysql 모듈을 로딩.


var pug = require('pug');

var fs = require('fs');

var formidable = require('formidable'); // 이 라우터 모듈은 req 객체를 파싱하는데 formidable 모듈을 사용함.


var path = require('path');

var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
  extended: false
}));
var pugFile2 = fs.readFileSync(path.join(__dirname, "../views/usercompleteproject.pug"), 'utf8'); // 이 라우터 모듈은 db를 사용함.

router.get('/', function (req, res) {
  res.status(200).send(pug.render(pugFile2));
});
router.post('/', function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, "../public/spendfile");
  form.parse(req, function (err, body, files) {
    var file = files.spendfile; // input(type="file", name="spendfile")에서 보내온 파일
    // 파일 이름을 현재시간.txt 로 변경

    var date = Date.now();
    var newPath = form.uploadDir + "/" + date + path.extname(file.name);
    fs.rename(file.path, newPath, function (err) {
      console.log("프로젝트 사용내역 파일 등록!");
    });
    var query = 'UPDATE PROJECT SET PROJECT_SPEND_FILE=? WHERE PROJECT_NUM =?';
    var params = [date, req.session.projectid];
    connection.query(query, params, function (err, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log(req.session.projectid + " 프로젝트 사용내역등록");
        res.status(200).redirect('/project/list');
      }
    });
  });
});
module.exports = router;