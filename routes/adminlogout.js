const express = require('express');
const pug = require('pug');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// pug 파일 비동기적으로 로드.
const pugFile = fs.readFileSync(path.join(__dirname, "../views/adminlogin.pug"), 'utf8');

// 사용자에게 adminlogin.pug 파일을 보여준다.
router.get('/', (req, res) => {
    req.session.login_id = undefined;
    req.session.admin = undefined;
    res.status(200).send(pug.render(pugFile));
});module.exports = router;