let radius = 6371; // earth's mean radius in km

// Helper function to convert degrees to radians
function DegToRad(deg) {
    return (deg * Math.PI / 180);
}

// Helper function to convert radians to degrees
function RadToDeg(rad) {
    return (rad * 180 / Math.PI);
}

module.exports = {
	// Calculate the (initial) bearing between two points, in degrees
	CalculateBearing: function(startPoint, endPoint) {
		    let lat1 = DegToRad(startPoint[1]);
		    let lat2 = DegToRad(endPoint[1]);
		    let deltaLon = DegToRad(endPoint[0] - startPoint[0]);

		    let y = Math.sin(deltaLon) * Math.cos(lat2);
		    let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
		    let bearing = Math.atan2(y, x);

		    // since atan2 returns a value between -180 and +180, we need to convert it to 0 - 360 degrees
		    return (RadToDeg(bearing) + 360) % 360;
	},

		// Calculate the destination point from given point having travelled the given distance (in km), on the given initial bearing (bearing may vary before destination is reached)
		CalculateDestinationLocation: function( point,  bearing,  distance) {

		    distance = distance / radius; // convert to angular distance in radians
		    bearing = DegToRad(bearing); // convert bearing in degrees to radians

		    let lat1 = DegToRad(point[1]);
		    let lon1 = DegToRad(point[0]);

		    let lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance) + Math.cos(lat1) * Math.sin(distance) * Math.cos(bearing));
		    let lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(lat1), Math.cos(distance) - Math.sin(lat1) * Math.sin(lat2));
		    lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalize to -180 - + 180 degrees

		    return  [ RadToDeg(lon2), RadToDeg(lat2)];
	},

	 // Calculate the distance between two points in km
	 CalculateDistanceBetweenLocations: function(startPoint, endPoint) {

		    let lat1 = DegToRad(startPoint[1]);
		    let lon1 = DegToRad(startPoint[0]);

		    let lat2 = DegToRad(endPoint[1]);
		    let lon2 = DegToRad(endPoint[0]);

		    let deltaLat = lat2 - lat1;
		    let deltaLon = lon2 - lon1;

		    let a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
		    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		    return (radius * c);
	}
}
