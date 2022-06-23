"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var pug = require('pug');

var connection = require('../db');

var fs = require('fs');

var path = require('path');

var router = express.Router();
router.get('/', function (req, res) {
  //탈퇴신청한 회원들의 목록 조회
  var sql = 'SELECT * FROM USER AS U, USERMONEY AS M WHERE U.USER_NUM=M.USER_NUM AND USER_EXIT = ? ';
  var param2 = 1;
  connection.query(sql, param2, function (error, results, fields) {
    console.log(results);
    res.render('userwithdrawl.pug', {
      goods1: results
    });
  });
}); //회원삭제

router.get('/:id/userdelete', function (req, res) {
  var id = req.params.id;
  console.log(id);
  connection.query('SET FOREIGN_KEY_CHECKS=0', function (err, rows) {
    if (err) console.log(err);
    connection.query('DELETE FROM USER WHERE USER_NUM=?', [id], function (err) {
      if (err) console.log(err);
      console.log("회원 삭제");
      res.status(200).redirect('/auth/userwithdrawl');
    });
  });
});
module.exports = router;