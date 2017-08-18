const knex = require('knex')(require('./knexfile'))

 var addPoint  = function({ lat, lng, isIllegalPoint }) {
    console.log(`lat: ${lat} lng: ${lng} isIllegalPoint: ${isIllegalPoint}`)
    return knex('point').insert({
      lat,
      lng,
      isIllegalPoint
    })
  }


  var getAllPoints = function(){
  	console.log("getting all points")
  	return knex.select().table('point')
  };

  module.exports.addPoint = addPoint;
  module.exports.getAllPoints = getAllPoints;