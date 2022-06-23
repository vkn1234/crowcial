const express = require('express');
const router = express.Router();
var connection = require('../db'); //mysql 모듈을 로딩.
const pug = require('pug');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
/*
 로딩된 mysql 객체로부터 커넥션을 하나 생성합니다. 이때 실제적인 DB와의 연결은 이루어지지 않습니다.
 이후 query문이 실행될 때 이 커넥션을 통해 DB와 연결됩니다.
 */

const pugFile = fs.readFileSync(path.join(__dirname, "../views/list.pug"), 'utf8');
router.get('/list', function (req, res) {
    connection.query("select * from PROJECT", function (err, rows) {
        if (err) {
            console.log("err : " + err);
        }  else {
            console.log("rows : " + JSON.stringify(rows));
            //res.render('list', {rows: rows ? rows : {}});
            res.send(pug.render(pugFile, {
                rows: rows
            }));
        }
        connection.release();
    });
});

router.get('/content', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        console.log("rows : " + "select * from PROJECT" + req.query.brdno);
        connection.query("select * from PROJECT" + req.query.brdno, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));
            res.render('views/read', {row: rows[0]});
            connection.release();
        });
    });
});

router.get('/insert', function (req, res, next) {
    if (!req.query.brdno) {
        res.render('board1/form', {row: ""});
        return;
    }
    pool.getConnection(function (err, connection) {
        connection.query("select PROJECT_TITLE=?, PROJECT_CONTENT=?, PROJECT_USERNUM=?, PROJECT_DUE=?, PROJECT_MONEY=? FROM PROJECT" + req.query.brdno, function (err, rows) {
            if (err) console.error("err : " + err);

            res.render('board1/form', {row: rows[0]});
            connection.release();
        });
    });
});

router.post('/save', function (req, res, next) {
    var data = [req.body.brdtitle, req.body.brdmemo, req.body.brdwriter, req.body.brdno];
    console.log("rows : " + data);

    pool.getConnection(function (err, connection) {
        var sql = "";
        if (req.body.brdno) {
            sql = "UPDATE PROJECT" +
                " SET PROJECT_TITLE=?, PROJECT_CONTENT=?, PROJECT_USERNUM=?, PROJECT_DUE=?, PROJECT_MONEY=? FROM PROJECT";
        } else {
            sql = "INSERT INTO PROJECT(PROJECT_TITLE, PROJECT_CONTENT, PROJECT_USERNUM, PROJECT_DUE, PROJECT_MONEY) VALUES(?,?,?, NOW())";
        }
        connection.query(sql, data, function (err, rows) {
            if (err) console.error("err : " + err);

            res.redirect('/board1/list');
            connection.release();
        });
    });
});

router.get('/delete', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        connection.query("DELETE FROM PROJECT WHERE PROJECT_NO=" + req.query.PROJECT_NO, function (err, rows) {
            if (err) console.error("err : " + err);
            res.redirect('/board1/list');
            connection.release();
        });
    });
});

module.exports = router;
