"use strict";

var express = require('express');

var connection = require('../db');

var device = require('express-device');

var router = express.Router(); // 이 라우터 모듈은 접속한 사용자가 desktop 유저인지 phone 유저인지를 비교하는 모듈을 사용함.

router.use(device.capture()); // 모바일 어플리케이션이 실행되면 서버에 요청해서 세션id를 발급받는다.

router.get('/', function (req, res) {
  if (req.device.type == 'phone') {
    var query = "INSERT INTO SESSION (SESSION_ID) VALUES (?)";
    var params = [req.sessionID];
    connection.query(query, params, function (err, rows) {
      console.log(req.sessionID);
      res.json({
        sessionId: req.sessionID
      });
    });
  }
}); // 세션ID가 아직 유효한지(DB에 있는지) 검사하고 클라이언트에게 응답해준다.

router.get('/check', function (req, res) {
  var query = 'SELECT * FROM SESSION WHERE SESSION_ID=? AND LOGIN_ID IS NOT NULL';
  var params = [req.query.sessionid];
  connection.query(query, params, function (err, sessions) {
    if (sessions.length > 0) {
      var query = 'SELECT * FROM USER WHERE USER_ID=?';
      var params = [sessions[0].LOGIN_ID];
      connection.query(query, params, function (err, rows) {
        console.log(rows[0].USER_NAME);

        if (rows[0].USER_STOP != 1) {
          res.json({
            LOGIN_ID: sessions[0].LOGIN_ID,
            USER_NAME: rows[0].USER_NAME,
            USER_NUM: rows[0].USER_NUM,
            VALID: true
          });
        } else {
          res.json({
            LOGIN_ID: sessions[0].LOGIN_ID,
            USER_NAME: rows[0].USER_NAME,
            USER_NUM: rows[0].USER_NUM,
            VALID: false
          });
        }
      });
    } else {
      console.log("세션id는 만료되었음");
      res.json({
        VALID: false
      });
    }
  });
});
module.exports = router;