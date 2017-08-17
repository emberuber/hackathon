const knex = require('knex')(require('./knexfile'))
module.exports = {
  addPoint ({ lat, lng, isIllegalPoint }) {
    console.log(`lat: ${lat} lng: ${lng} isIllegalPoint: ${isIllegalPoint}`)
    return knex('point').insert({
      lat,
      lng,
      isIllegalPoint
    })
  }
}