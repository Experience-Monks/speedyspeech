var speedyspeech = require( '../index' );

var keywords = [ 'sports', 'future', 'family' ];

console.log( speedyspeech );

var fastRecog = new speedyspeech( {

	keywords: keywords
}, function( err, result, confidence, foundKeyword ) {

	if( err )
		throw err;

	console.log( result, confidence, foundKeyword );
});

fastRecog.start();