const express = require('express');
var connection = require('../db');
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const cryptoKey = "Crowcial만 알 수 있는 비밀 키";
// pug 파일 비동기적으로 로드.
const pugFile = fs.readFileSync(path.join(__dirname, "../views/support-log.pug"), 'utf8');

// 사용자에게 pug 파일을 보여준다.
router.get('/', (req, res) => {
    if (req.session.admin) {
        var query = 'SELECT FUND_NUM, USER_NAME, USER_ID, PROJECT_NAME, F.PROJECT_NUM, FUND_DATE, FUND_MONEY ';
        query += 'FROM FUNDPROJECT AS F, USER AS U, PROJECT AS P ';
        query += 'WHERE F.USER_NUM=U.USER_NUM AND F.PROJECT_NUM=P.PROJECT_NUM ';
        connection.query(query, (err, rows) => {
            res.status(200).send(pug.render(pugFile, {
                rows: rows
            }));
        });
    }
});

module.exports = router;