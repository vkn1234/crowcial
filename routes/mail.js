const express = require('express');
const nodemailer = require('nodemailer');
const formidable = require('formidable'); // 이 라우터 모듈은 req 객체를 파싱하는데 formidable 모듈을 사용함.
var connection = require('../db');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const router = express.Router();
router.use(cookieParser());
// 회원가입 창에서 전송 버튼을 누르면 POST로 요청한다.
module.exports.mailsend=router.post('/mailsend', (req, res,err) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, body, file) {
        // 중복된 이메일이 이미 가입되어있는지 확인
        var query = 'SELECT USER_NUM FROM USER WHERE USER_MAIL_NAME=? AND USER_MAIL_DOMAIN=?';
        var params = [body.mailleft, body.mailright];
        console.log(params)
            // 데스크탑 전용
        if (req.device.type == 'desktop') {
            
        }else if (req.device.type == 'phone') {
             // 모바일에서 서버의 세션에 접근하는데 어려움을 겪어서 세션에 해당하는 정보를 저장소에서 가져옴
            var query = 'SELECT * FROM SESSION WHERE SESSION_ID=?';
            var params = [body.sessionid];
        }
        connection.query(query, params, (err, sessions) => {
            if (sessions.length > 0) {
                if (rows.length > 0) {
                    if (req.device.type == 'desktop') {
                        res.status(200).send(pug.render(registerpug, {
                            direct: "/auth/register/mailsend",
                            method: "POST",
                            message: "이미 가입된 이메일입니다",
                            certcode: req.session.reg_certcode,
                            certified: req.session.reg_certified, username: body.username, userid: body.userid,password: body.password, password2: body.password2,mailleft: body.mailleft, mailright: body.mailright, mailcert: body.mailcert, bank: body.bank, bankaccount: body.bankaccount, checkbox1: body.checkbox1, checkbox2: body.checkbox2
                        }));
                    }else if (req.device.type == 'phone') {
                        res.json({
                            ALREADY_MAIL: true
                        });
                    }
                }else {
                    if (req.device.type == 'desktop') {
                        // 이메일 인증을 아직 안했으면 이메일을 전송해줌.
                        if (req.session.reg_certified != "on") {
                            req.session.reg_mailleft = body.mailleft;
                            req.session.reg_mailright = body.mailright;
                            req.session.reg_certcode = String(Math.floor(Math.random() * (999999 - 100000)) + 100000);
                            console.log(req.session.reg_certcode);
                            var transporter = nodemailer.createTransport({
                                service: 'gmail', auth: { user: 'crowcial@gmail.com', pass: 'crowding123' }
                            });
                                    
                            var mailOptions = {
                                from: 'crowcial@gmail.com',
                                to: body.mailleft + '@' + body.mailright, subject: 'Crowcial 인증번호입니다.', text: '인증번호: ' + req.session.reg_certcode
                            };
                            transporter.sendMail(mailOptions, (err, info) => {
                                if (!err) {
                                    console.log('Email Sent: ' + info.response);
                                } else {
                                    console.log('nodemailer error: ' + err);
                                }
                            });
                        }
                        // 화면을 보여줌.
                        res.status(200).send(pug.render(registerpug, {
                            direct: "/auth/register/mailsend",
                            method: "POST",
                            certcode: req.session.reg_certcode, certified: req.session.reg_certified, username: body.username, userid: body.userid, password: body.password, password2: body.password2, mailleft: body.mailleft, mailright: body.mailright, mailcert: body.mailcert, bank: body.bank, bankaccount: body.bankaccount, checkbox1: body.checkbox1, checkbox2: body.checkbox2
                        }));
                    } else if (req.device.type == 'phone') {
                        console.log("certified여부: " + sessions[0].REG_CERTIFIED);
                        // 이메일 인증을 아직 안했으면 이메일을 전송해줌.
                        if (sessions[0].REG_CERTIFIED == null) {
                            var certcode = String(Math.floor(Math.random() * (999999 - 100000)) + 100000);
                            var query = 'UPDATE SESSION SET REG_CERTCODE=?, REG_MAILLEFT=?, REG_MAILRIGHT=? WHERE SESSION_ID=?'
                            var params = [certcode, body.mailleft, body.mailright, sessions[0].SESSION_ID];
                            connection.query(query, params, (err, rows) => {
                                console.log(certcode);
                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'crowcial@gmail.com',
                                        pass: 'crowding123'
                                    }
                                });
                                var mailOptions = {
                                    from: 'crowcial@gmail.com',
                                    to: body.mailleft + '@' + body.mailright, subject: 'Crowcial 인증번호입니다.', text: '인증번호: ' + certcode
                                };
                                transporter.sendMail(mailOptions, (err, info) => {
                                    if (!err) {
                                        console.log('Email Sent: ' + info.response);
                                    } else {
                                        console.log('nodemailer error: ' + err);
                                    }
                                });
                                res.json({
                                    MESSAGE: '인증메일이 전송되었습니다.',
                                    CERTIFIED: false
                                });
                            });
                        } else {
                            res.json({
                                CERTIFIED: true
                            });
                        }
                    }
                }
            } else {
                    // 이메일 인증이 아직 확인 안되었으면 자동으로 저장된 image file을 삭제하고 화면을 다시 보여줌.
                if (req.device.type == 'desktop') {
                    fs.unlink(file.path, (err) => {
                        console.log("삭제: " + file.path);
                    });
                    res.status(200).send(pug.render(registerpug, {
                        direct: "/auth/register", method: "POST", certcode: req.session.reg_certcode, certified: req.session.reg_certified, username: body.username, userid: body.userid, password: body.password, password2: body.password2, mailleft: body.mailleft, mailright: body.mailright, mailcert: body.mailcert, bank: body.bank, bankaccount: body.bankaccount, checkbox1: body.checkbox1, checkbox2: body.checkbox2
                    }));
                }else if (req.device.type == 'phone') {
                    res.status(400).send();
                }
            }
        });
    });
    if (err) {
        console.log(err);
    }
});

// 회원가입 창에서 인증 버튼을 누르면 POST로 요청한다.
module.exports.mailcert=router.post('/mailcert', (req, res) => {
    var form = new formidable.IncomingForm();
    // 데스크탑 전용
    if (req.device.type == 'desktop') {
        form.parse(req, function(err, body, files) {
            // 서버에서 인증번호를 생성하고 세션에 저장해둔 것과 사용자가 입력한 인증번호가 일치하면 인증되었음을 세션에 기록
            if (req.session.reg_certcode && !req.session.reg_certified && req.session.reg_certcode == body.mailcert) {
                req.session.reg_certified = "on";
            }
    
            // 화면을 보여줌
            res.status(200).send(pug.render(registerpug, {
                direct: "/auth/register/mailcert",
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
        });
    // 모바일 전용
    } else if (req.device.type == 'phone') {
        form.parse(req, function(err, body, files) {
            // 모바일에서 서버의 세션에 접근하는데 어려움을 겪어서 세션에 해당하는 정보를 저장소에서 가져옴
            var query = 'SELECT * FROM SESSION WHERE SESSION_ID=?';
            var params = [body.sessionid];
            connection.query(query, params, (err, sessions) => {
                if (sessions.length > 0) {
                    // 서버에서 인증번호를 생성하고 세션에 저장해둔 것과 사용자가 입력한 인증번호가 일치하면 인증되었음을 세션에 기록
                    if (!sessions[0].REG_CERTIFIED) {
                        if (sessions[0].REG_CERTCODE != null) {
                            if (sessions[0].REG_CERTCODE == body.mailcert) {
                                var query = 'UPDATE SESSION SET REG_CERTIFIED=true'
                                connection.query(query, (err) => {
                                    res.json({
                                        CERTIFIED: true,
                                        MESSAGE: "인증되었습니다."
                                    });
                                });
                            } else {
                                res.json({
                                    MESSAGE: "인증번호를 올바르게 입력해주세요."
                                });
                            }
                        } else {
                            res.json({
                                MESSAGE: "인증메일을 먼저 발송해주세요."
                            });
                        }
                    } else {
                        res.json({
                            MESSAGE: "이미 인증되었습니다."
                        });
                    }
                } else {
                    res.status(400).send();
                }
            });
        });
    }
});
