const express = require('express')
const bodyParser = require('body-parser')
const store = require('./store')
const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/addPoint', (req, res) => {
  store
    .addPoint({
      lat: req.body.lat,
      lng: req.body.lng,
      isIllegalPoint: req.body.isIllegalPoint
    })
    .then(() => res.sendStatus(200))
})
app.get('/getAllPoints', (req, res) => {
  store
    .getAllPoints()
    .then(function (points){
    	res.status(200).json(points);
    })
})
app.listen(7555, () => {
  console.log('Server running on http://localhost:7555')
})