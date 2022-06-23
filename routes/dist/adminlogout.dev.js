"use strict";

var express = require('express');

var pug = require('pug');

var fs = require('fs');

var path = require('path');

var router = express.Router(); // pug 파일 비동기적으로 로드.

var pugFile = fs.readFileSync(path.join(__dirname, "../views/adminlogin.pug"), 'utf8'); // 사용자에게 adminlogin.pug 파일을 보여준다.

router.get('/', function (req, res) {
  req.session.login_id = undefined;
  req.session.admin = undefined;
  res.status(200).send(pug.render(pugFile));
});
module.exports = router;