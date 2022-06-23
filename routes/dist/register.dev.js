"use strict";

var express = require('express');

var mail = require('./mail');

var formidable = require('formidable'); // 이 라우터 모듈은 req 객체를 파싱하는데 formidable 모듈을 사용함.


var pug = require('pug');

var connection = require('../db');

var fs = require('fs');

var path = require('path');

var crypto = require('crypto');

var device = require('express-device');

var cookieParser = require('cookie-parser');

var router = express.Router(); // 이 라우터 모듈은 cookie-parser 모듈을 사용함.

router.use(cookieParser()); // 이 라우터 모듈은 접속한 사용자가 desktop 유저인지 phone 유저인지를 비교하는 모듈을 사용함.

router.use(device.capture()); // pug 파일 동기적으로 로드.

var registerpug = fs.readFileSync(path.join(__dirname, "../views/register.pug"), 'utf8');
var registerCompletepug = fs.readFileSync(path.join(__dirname, "../views/register-complete.pug"), 'utf8'); // GET /auth/regsiter: 이미 로그인되었다는 정보가 세션에 있다면 메인화면으로 이동하고(나중에 수정), 아직 로그인이 안되었으면 사용하는 세션을 초기화하고 회원가입 화면을 보여준다.

router.get('/', function (req, res) {
  if (!req.session.login_id) {
    req.session.reg_mailleft = undefined; // 사용자가 이메일 인증을 받아놓고 다른 이메일로 변경해서 작성하는 경우를 방지하여 인증번호를 보냈던 이메일을 세션에 기억해둔다.

    req.session.reg_mailright = undefined;
    req.session.reg_certcode = undefined;
    req.session.reg_certified = undefined;
    res.status(200).send(pug.render(registerpug));
  } else {
    res.status(405).send('당신은 이미 로그인중인데 또 회원가입을?? ' + req.session.login_id + '님');
  }
});
mail.mailsend;
mail.mailcert; // 회원가입 창에서 가입 버튼을 누르면 POST로 요청한다.

router.post('/', function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, "../public/images/profiles");
  form.parse(req, function (err, body, files) {
    var files = files.profile; // input(type="file", name="profile")에서 보내온 파일

    if (req.device.type == "desktop") {
      // 이메일 인증이 확인되었을때
      if (req.session.reg_certified) {
        // 패스워드 암호화  
        var ciResult = encrypt(body.password);
        ciResult += ci["final"]('hex'); // DB에 이미 아이디가 겹치는게 존재하는지 체크함.

        connection.query('SELECT * FROM USER WHERE USER_ID LIKE ' + '"' + body.userid + '"', function (err, results) {
          // 이미 겹치는게 존재하면 회원가입 화면에서 alert할 수 있게 alreadyid를 on으로 설정후 사용자가 다시 입력하도록 보여줌.
          if (results.length > 0) {
            fs.unlink(file.path, function (err) {
              console.log("삭제: " + file.path);
            });
            res.status(200).send(pug.render(registerpug, {
              direct: "/auth/register",
              method: "POST",
              certcode: req.session.reg_certcode,
              certified: req.session.reg_certified,
              mailleft: req.session.reg_mailleft,
              mailright: req.session.reg_mailright,
              username: body.username,
              userid: body.userid,
              password: body.password,
              password2: body.password2,
              mailcert: body.mailcert,
              bank: body.bank,
              bankaccount: body.bankaccount,
              checkbox1: body.checkbox1,
              checkbox2: body.checkbox2,
              alreadyid: "on"
            })); // 겹치는게 존재하지 않으면 db에 INSERT
          } else {
            // 파일 이름을 현재시간.jpg or 현재시간.png로 변경
            var date = Date.now();
            var newPath = form.uploadDir + "/" + date + path.extname(file.name);
            fs.rename(file.path, newPath, function (err) {
              console.log("파일명 변경!");
            }); // USER 테이블에 INSERT

            var query = "INSERT INTO USER (USER_NAME, USER_ID, USER_PASS, USER_MAIL_NAME, USER_MAIL_DOMAIN, USER_BANK, USER_ACCOUNT, USER_IMAGE, USER_EXIT, USER_STOP) ";
            query += "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            var params = [body.username, body.userid, ciResult, req.session.reg_mailleft, req.session.reg_mailright, body.bank, body.bankaccount, date, 0, 0];
            connection.query(query, params, function (err, rows, fields) {
              // USERMONEY 테이블에 INSERT
              var query = "INSERT INTO USERMONEY (USER_NUM, USER_NOW, USER_TOTAL, USER_PSEND) VALUES (?, ?, ?, ?)";
              var params = [rows.insertId, 0, 0, 0];
              connection.query(query, params, function (err, rows, fields) {
                // 회원가입 완료 화면을 보여줌.
                res.status(200).send(pug.render(registerCompletepug, {
                  userid: body.userid
                }));
              });
            });
          }
        });
      } // 이메일 인증이 아직 확인 안되었으면 자동으로 저장된 image file을 삭제하고 화면을 다시 보여줌.
      else {
          // fs.unlink(files.path, (err) => {
          //     console.log("삭제: " + files.path);
          //     if (err) {
          //         console.log(err);
          //     }
          // });
          res.status(200).send(pug.render(registerpug, {
            direct: "/auth/register",
            method: "POST",
            certcode: req.session.reg_certcode,
            certified: req.session.reg_certified,
            username: body.username,
            userid: body.userid,
            password: body.password,
            password2: body.password2,
            mailleft: body.mailleft,
            mailright: body.mailright,
            mailcert: body.mailcert,
            bank: body.bank,
            bankaccount: body.bankaccount,
            checkbox1: body.checkbox1,
            checkbox2: body.checkbox2
          }));
        } // 모바일

    } else if (req.device.type == "phone") {
      var files = files.upload; // 모바일에서 보내온 이미지 파일
      // 모바일에서 서버의 세션에 접근하는데 어려움을 겪어서 세션에 해당하는 정보를 저장소에서 가져옴

      var query = 'SELECT * FROM SESSION WHERE SESSION_ID=?';
      var params = [body.sessionid];
      connection.query(query, params, function (err, sessions) {
        // 세션처럼 사용할 정보가 DB에 있는지 확인
        if (sessions.length > 0) {
          // 이메일 인증이 확인되었을때
          if (sessions[0].REG_CERTIFIED) {
            var ciResult = encrypt(body.password);
            ciResult += ci["final"]('hex'); // DB에 이미 아이디가 겹치는게 존재하는지 체크함.

            connection.query('SELECT * FROM USER WHERE USER_ID LIKE ' + '"' + body.userid + '"', function (err, results) {
              // 이미 겹치는게 존재하면 사용자가 다시 입력하도록 메시지를 보내줌
              if (results.length > 0) {
                fs.unlink(file.path, function (err) {
                  console.log("삭제: " + file.path);
                });
                res.json({
                  MESSAGE: '이미 존재하는 ID입니다.'
                }); // 겹치는게 존재하지 않으면 db에 INSERT
              } else {
                // 파일 이름을 현재시간.jpg or 현재시간.png로 변경
                var date = Date.now();
                var newPath = form.uploadDir + "/" + date + '.jpg';
                fs.rename(files.path, newPath, function (err) {
                  console.log("파일명 변경!");
                }); // USER 테이블에 INSERT

                var query = "INSERT INTO USER (USER_NAME, USER_ID, USER_PASS, USER_MAIL_NAME, USER_MAIL_DOMAIN, USER_BANK, USER_ACCOUNT, USER_IMAGE, USER_EXIT, USER_STOP) ";
                query += "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                var params = [body.username, body.userid, ciResult, sessions[0].REG_MAILLEFT, sessions[0].REG_MAILRIGHT, body.bank, body.bankaccount, date, 0, 0];
                connection.query(query, params, function (err, rows, fields) {
                  // USERMONEY 테이블에 INSERT
                  var query = "INSERT INTO USERMONEY (USER_NUM, USER_NOW, USER_TOTAL, USER_PSEND) VALUES (?, ?, ?, ?)";
                  var params = [rows.insertId, 0, 0, 0];
                  connection.query(query, params, function (err, rows, fields) {
                    // 회원가입이 완료되었음을 사용자에게 알려줌
                    res.json({
                      USERID: body.userid,
                      REG_COMPLETE: true
                    });
                  });
                });
              }
            });
          } // 이메일 인증이 아직 확인 안되었으면 자동으로 저장된 image file을 삭제함
          else {
              fs.unlink(files.path, function (err) {
                console.log("삭제: " + files.path);
              });
              res.json({
                MESSAGE: "이메일 인증이 필요합니다."
              });
            }
        } else {
          // 해당 세션id에 해당하는 데이터가 DB에 없으면 400 상태코드로 클라이언트에 응답함.
          res.status(400).send();
        }
      });
    }
  });
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