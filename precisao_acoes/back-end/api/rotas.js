const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    res.send('Teste');
});

module.exports = router;