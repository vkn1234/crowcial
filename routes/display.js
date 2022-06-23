const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');
var connection = require('../db');
const fs = require('fs');
const path = require('path');
const router = express.Router();
router.use(bodyParser.urlencoded({extended:false}));

router.get('/', (req, res) => {
    var sql = 'SELECT * FROM USER AS U, USERMONEY AS M WHERE U.USER_NUM=M.USER_NUM AND USER_STOP = ? '
    var param = 0;
    var param2 = 1;
    connection.query(sql, param, function (error, results1, fields) {
        connection.query(sql, param2, function (error, results2, fields) {
            console.log(results1);
            console.log(results2);
            res.render('display.pug', { goods1: results1, goods2: results2 });
        });
    });
});//회원정지
router.get('/:id/userstop', (req, res) => { // NUM을 어떻게 알 것인지 핵심. 사이트 창에서 그정보를 받아와함.
    var id = req.params.id;
    console.log(id);
    connection.query('UPDATE USER SET USER_STOP=? WHERE USER_NUM=?',[1,id],()=>{
        console.log("회원 정지실행");
        }
    );
    res.status(200).redirect('/project/user/display');
});

//회원정지취소
router.get('/:id/userstopcancel', (req, res) => { // NUM을 어떻게 알 것인지 핵심. 사이트 창에서 그정보를 받아와함.
    var id = req.params.id;
    console.log(id);

    connection.query('UPDATE USER SET USER_STOP=? WHERE USER_NUM=?',[0,id],()=>{
        console.log("회원 정지 취소 실행");
        }
    );
    res.status(200).redirect('/project/user/display');
});

//금액 충전
router.post('/:id/insert', (req, res) => { // NUM을 어떻게 알 것인지 핵심. 사이트 창에서 그정보를 받아와함.
    var id = req.params.id;
    console.log("ID : ",id);
    var money = req.body.money
    console.log("MONEY : ",money);
    connection.query('UPDATE USERMONEY SET USER_NOW=USER_NOW+? WHERE USER_NUM=?',[money,id],()=>{
        console.log("금액 충전 완료");
        }
    );
    res.status(200).redirect('/project/user/display');
});

module.exports = router;
