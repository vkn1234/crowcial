"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var connection = require('../db');

var pug = require('pug');

var fs = require('fs');

var path = require('path');

var crypto = require('crypto');

var device = require('express-device');

var router = express.Router(); // 이 라우터 모듈은 접속한 사용자가 desktop 유저인지 phone 유저인지를 비교하는 모듈을 사용함.

router.use(device.capture()); // 이 라우터 모듈은 req 객체를 파싱하는데 body-parser를 사용함.

router.use(bodyParser.urlencoded({
  extended: false
})); // pug 파일 동기적으로 로드.

var pugFile = fs.readFileSync(path.join(__dirname, "../views/login.pug"), 'utf8'); // 사용자에게 login.pug 파일을 보여준다.

router.get('/', function (req, res) {
  if (req.device.type == 'desktop') {
    if (!req.session.admin) {
      if (!req.session.login_id) {
        res.status(200).send(pug.render(pugFile));
      } else {
        res.status(200).redirect('/project/list');
      }
    } else {
      req.session.login_id = undefined;
      req.session.login_usernum = undefined;
      req.session.admin = undefined;
      res.status(200).send(pug.render(pugFile));
    }
  }
}); // 사용자가 로그인 화면에서 로그인 버튼을 누르면 동작

router.post('/', function (req, res) {
  console.log(req.body.userid);
  connection.query('SELECT * FROM USER WHERE USER_ID LIKE ' + '"' + req.body.userid + '"', function (err, results) {
    if (results.length > 0) {
      var ciResult = encrypt(req.body.password);
      console.log(ciResult);

      if (ciResult == results[0].USER_PASS) {
        if (results[0].USER_STOP != 1) {
          if (req.device.type == 'desktop') {
            req.session.login_id = results[0].USER_ID;
            req.session.login_usernum = results[0].USER_NUM;
            res.status(200).redirect('/project/list');
          } else if (req.device.type == 'phone') {
            var query = "INSERT INTO SESSION (SESSION_ID, LOGIN_ID, USER_NUM) VALUES (?, ?, ?)";
            var params = [req.sessionID, req.body.userid, results[0].USER_NUM];
            connection.query(query, params, function (err, rows) {
              console.log("로그인 성공!");
              console.log(results[0].USER_NUM);
              res.json({
                sessionId: req.sessionID,
                userid: req.body.userid,
                username: results[0].USER_NAME,
                usernum: results[0].USER_NUM,
                imageName: results[0].USER_IMAGE,
                LOGIN_COMPLETE: true,
                WRONG_PASSWORD: false,
                UNKNOWN_USERID: false
              });
            });
          }
        } else {
          if (req.device.type == 'desktop') {
            res.status(200).send(pug.render(pugFile, {
              errorMsg: "정지된 계정입니다.",
              userid: req.body.userid,
              password: req.body.password
            }));
          } else if (req.device.type == 'phone') {
            res.json({
              LOGIN_COMPLETE: false,
              WRONG_PASSWORD: false,
              UNKNOWN_USERID: false,
              STOPPED_ID: true
            });
          }
        }
      } else {
        if (req.device.type == 'desktop') {
          res.status(200).send(pug.render(pugFile, {
            errorMsg: "비밀번호가 틀렸습니다.",
            userid: req.body.userid,
            password: req.body.password
          }));
        } else if (req.device.type == 'phone') {
          res.json({
            LOGIN_COMPLETE: false,
            WRONG_PASSWORD: true,
            UNKNOWN_USERID: false
          });
        }
      }
    } else {
      if (req.device.type == 'desktop') {
        res.status(200).send(pug.render(pugFile, {
          errorMsg: "그런 ID는 없습니다.",
          userid: req.body.userid,
          password: req.body.password
        }));
      } else if (req.device.type == 'phone') {
        res.json({
          LOGIN_COMPLETE: false,
          WRONG_PASSWORD: false,
          UNKNOWN_USERID: true
        });
      }
    }
  }); // 모바일     
}); // 모바일에서 사용자의 돈정보를 가져옴

router.get('/money', function (req, res) {
  if (req.device.type == 'phone') {
    var query = 'SELECT * FROM USERMONEY WHERE USER_NUM=?';
    var params = [req.query.usernum];
    connection.query(query, params, function (err, rows) {
      if (err) console.log(err);
      res.status(200).json({
        money: rows[0].USER_NOW
      });
    });
  }
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

module.exports = router;