var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

var SpeedySpeech = function( settings, callBack ) {

	if( !( this instanceof SpeedySpeech ) )
		return new SpeedySpeech( settings, callBack );

	var keywords = settings.keywords;

	if( !keywords ) {

		throw new Error( 'you must pass in keywords' );
	}

	if( !SpeechRecognition ) {

		callBack( new Error( 'speech recognition is not available' ) );
		return;
	}

	this.isRecognizing = false;
	this.keyWordConfidence = settings.keyWordConfidence || 0.7;
	this.autoRestart = settings.autoRestart || false;
	this.onTimeOut = settings.onTimeOut || null;
	this.setKeywords( keywords );

	this.callBack = callBack;

	this.onRResult = this.onRResult.bind( this );
	this.onREnd = this.onREnd.bind( this );
	this.onRError = this.onRError.bind( this );

	this.recognition = new SpeechRecognition();

	if( settings.language )
		this.recognition.lang = settings.language;

	this.recognition.onstart = this.onRStart;
	this.recognition.onresult = this.onRResult;
	this.recognition.onend = this.onREnd;
	this.recognition.onerror = this.onRError;

	this.result = null; 
	this.confidence = null;
	this.foundWord = null;

	this.recognition.interimResults = true;
};

SpeedySpeech.isAvailable = Boolean( SpeechRecognition );

SpeedySpeech.prototype = {

	start: function() {

		if( !this.isRecognizing ) {

			this.isRecognizing = true;
			this.recognition.start();
		}
	},

	stop: function() {

		this.recognition.onend = null;

		if( this.isRecognizing ) {

			this.recognition.abort();
		}

		this.isRecognizing = false;
	},

	setKeywords: function( keywords ) {

		this.keyLookup = {};

		for( var i = 0, len = keywords.length; i < len; i++ ) {
			
			this.keyLookup[ keywords[ i ].toLowerCase() ] = true;
		}
	},

	onRResult: function( ev ) {

		var results = ev.results,
			result = [],
			resultPart, words, result, foundWord, confidence, isFinal;

		for( var i = 0, len = results.length; i < len; i++ ) {

			if( !results[ i ].isFinal ) { 

				for( var j = 0, lenJ = results[ i ].length; j < lenJ; j++ ) {

					resultPart = results[ i ][ j ];
					words = resultPart.transcript.toLowerCase().split( ' ' );

					for( var k = 0, lenK = words.length; k < lenK; k++ ) {

						if( this.keyLookup[ words[ k ] ] ) {

							if( resultPart.confidence > this.keyWordConfidence && 
								( confidence === undefined || resultPart.confidence > confidence ) ) {

								foundWord = words[ k ];
								confidence = resultPart.confidence;
							}
						}
					}

					result.push( resultPart.transcript );
				} 
			} else {

				isFinal = true;
				result = [ results[ i ][ 0 ].transcript ];
				confidence = results[ i ][ 0 ].confidence;

				break; //since this is final we'll break out
			}
		}


		if( foundWord || isFinal ) {

			// this will cause the speech recognition to end
			// and for recognition callback to be sent out
			this.recognition.abort();

			this.result = result.join( '' );
			this.confidence = confidence;
			this.foundWord = foundWord;
		}
	},

	onREnd: function() {

		this.isRecognizing = false;

		// if speech recognition has stopped and we don't have a result
		// then we'll auto restart
		if( !this.result ) {

			if( this.autoRestart ) {

				this.start();	
			}	

			if( this.onTimeOut )
				this.onTimeOut();
		// since we have a result we'll just return it
		} else {

			this.callBack( undefined, this.result, this.confidence, this.foundWord );

			this.result = null; 
			this.confidence = null;
			this.foundWord = null;
		}
	},

	onRError: function( err ) {

		if( err.error == 'not-allowed' ) {

			this.callBack( new Error( 'user denied speech recognition' ) );

		//aborted is when the stop has been called
		} else if( err.error != 'aborted' ) {

			this.callBack( err );
		}
	}
};

module.exports = SpeedySpeech;