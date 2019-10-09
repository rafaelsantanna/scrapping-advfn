const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const path = require('path');
const engines = require('consolidate');
process.setMaxListeners(0);

let app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

consign().include('routes').into(app);

app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(3000, '127.0.0.1', ()=>{
    console.log('server running');
});