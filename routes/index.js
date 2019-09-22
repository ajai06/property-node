var express = require('express');
var router = express.Router();
var userHandler = require('../controller/userHandler');
var pgHandler = require('../controller/pgHandler');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', userHandler.registerAction);

router.post('/login', userHandler.loginAction);

router.get('/activate/:token', userHandler.activateAction);

router.post('/resend', userHandler.resendAction);

router.get('/pglist', pgHandler.pglistAction);

router.get('/pg/:pgId', pgHandler.viewPg);

router.post('/addpg', pgHandler.verifyToken, pgHandler.addPgAction);

module.exports = router;
