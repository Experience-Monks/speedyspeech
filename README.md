# speedyspeech

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

This is a module to quickly use the Web Speech API to recognize keywords as a user speaks.

## Usage

[![NPM](https://nodei.co/npm/speedyspeech.png)](https://www.npmjs.com/package/speedyspeech)

```javascript
var speedyspeech = require('speedyspeech');

// these will be keywords that speedyspeech will look for
var keywords = [ 'sports', 'future', 'family' ];

var fastRecog = new speedyspeech({
    keywords: keywords
}, function( err, result, confidence, foundKeyword ) {

    if( err )
        throw err;
    
    // result is the what the person said that speech api picked up
    // confidence is the confidence of the sentence/word uttered
    // foundKeyword is a keyword which was found in the result
    console.log( result, confidence, foundKeyword );
    
    // after you receive a result you must start recognizing again
    fastRecog.start();
});

// start's speech recognition
fastRecog.start();

// stop's speech recognition
// fastRecog.stop();

// change keywords
// fastRecog.setKeywords([ 'some', 'new', 'keywords' ]);
```


## License

MIT, see [LICENSE.md](http://github.com/mikkoh/speedyspeech/blob/master/LICENSE.md) for details.
