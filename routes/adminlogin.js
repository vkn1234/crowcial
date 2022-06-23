const express = require('express');
const bodyParser = require('body-parser');
var connection = require('../db');
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const router = express.Router();
const cryptoKey = "Crowcial만 알 수 있는 비밀 키";

// 이 라우터 모듈은 req 객체를 파싱하는데 body-parser를 사용함.
router.use(bodyParser.urlencoded({ extended: false }));

// pug 파일 비동기적으로 로드.
const pugFile = fs.readFileSync(path.join(__dirname, "../views/adminlogin.pug"), 'utf8');
const loginsuccesspug = fs.readFileSync(path.join(__dirname, "../views/adminlogin-success.pug"), 'utf8');

// 사용자에게 adminlogin.pug 파일을 보여준다.
router.get('/', (req, res) => {
    var usernum = 0;
    var usermoney = 0;
    var projectnum = 0;
    var doingprojectnum = 0;
    var endprojectnum = 0;
    try {
        var query1 = "SELECT * FROM USER";
        connection.query(query1, (err, rows) => {
            usernum = rows.length;
            res.status(200).send(pug.render(loginsuccesspug, {
                usernum: usernum
            }));
            if (err) {
                console.log(err);
            }
        });
        
        var query2 = "SELECT * FROM PROJECT";
        connection.query(query2, (err, rows) => {
            projectnum = rows.length;
            res.status(200).send(pug.render(loginsuccesspug, {
                projectnum: projectnum
            }));
            if (err) {
                console.log(err);
            }
        });
        
        var query3 = "SELECT * FROM PROJECT WHERE DATE(PROJECT_DUE) > NOW()";
        connection.query(query3, (err, rows) => {
            doingprojectnum = rows.length;
            res.status(200).send(pug.render(loginsuccesspug, {
                doingprojectnum: doingprojectnum, 
            })); 
            if (err) {
                console.log(err);
            }
        });
        
        var query4 = "SELECT * FROM PROJECT WHERE DATE(PROJECT_DUE) <= NOW()";
        connection.query(query4, (err, rows) => {
            endprojectnum = rows.length;
            res.status(200).send(pug.render(loginsuccesspug, {
                endprojectnum: endprojectnum
            }));   
            if (err) {
                console.log(err);
            }   
        });
        
        var query5 = 'SELECT SUM(USER_NOW) AS SUMMONEY FROM USERMONEY;';
        connection.query(query5, (err, rows) => {
            usermoney = rows[0].SUMMONEY;
            res.status(200).send(pug.render(loginsuccesspug, {
                usermoney: usermoney
            }));
            if (err) {
                console.log(err);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(200).send(pug.render(pugFile));
    }
});

// 사용자가 로그인 화면에서 로그인 버튼을 누르면 동작
router.post('/', (req, res) => {
    
    var id = encrypt(req.body.userid);
    var password = encrypt(req.body.password);

    // 관리자ID: crowcialman 관리자PW: asdfghjkl;'
    if (id == '6b6f0e0c1bb772652b0d757edd02a357' && password == "1b85629b0bbeaf8c7e9286eecf048e07") {
        req.session.login_id = "admin";
        req.session.admin = "on";

        var usernum = 0;
        var usermoney = 0;
        var projectnum = 0;
        var doingprojectnum = 0;
        var endprojectnum = 0;
        try{
            var query1 = "SELECT * FROM USER";
            connection.query(query1, (err, rows) => {
                usernum = rows.length;
                res.status(200).send(pug.render(loginsuccesspug, {
                    usernum: usernum
                }));
                if (err) {
                    console.log(err);
                }
            });
            
            var query2 = "SELECT * FROM PROJECT";
            connection.query(query2, (err, rows) => {
                projectnum = rows.length;
                res.status(200).send(pug.render(loginsuccesspug, {
                    projectnum: projectnum
                }));
                if (err) {
                    console.log(err);
                }
            });
            
            var query3 = "SELECT * FROM PROJECT WHERE DATE(PROJECT_DUE) > NOW()";
            connection.query(query3, (err, rows) => {
                doingprojectnum = rows.length;
                res.status(200).send(pug.render(loginsuccesspug, {
                    doingprojectnum: doingprojectnum, 
                })); 
                if (err) {
                    console.log(err);
                }
            });
            
            var query4 = "SELECT * FROM PROJECT WHERE DATE(PROJECT_DUE) <= NOW()";
            connection.query(query4, (err, rows) => {
                endprojectnum = rows.length;
                res.status(200).send(pug.render(loginsuccesspug, {
                    endprojectnum: endprojectnum
                }));   
                if (err) {
                    console.log(err);
                }   
            });
            
            var query5 = 'SELECT SUM(USER_NOW) AS SUMMONEY FROM USERMONEY;';
            connection.query(query5, (err, rows) => {
                usermoney = rows[0].SUMMONEY;
                res.status(200).send(pug.render(loginsuccesspug, {
                    usermoney: usermoney
                }));
                if (err) {
                    console.log(err);
                }
            });
        } catch (error) {
            console.log(error, "올바른 관리자 정보를 입력하십시오.");
            res.status(200).send(pug.render(pugFile));
        }
    }
});
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'abcdefghijklmnop'.repeat(2) // Must be 256 bits (32 characters)
const IV_LENGTH = 16 // For AES, this is always 16

function encrypt(text) {
  const iv = '1234567890123456'
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  )
  var encrypted = cipher.update(text)
  encrypted+=cipher.final('hex')
  return encrypted;
}

module.exports = router;