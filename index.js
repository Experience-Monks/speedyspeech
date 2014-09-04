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
	this.setKeywords( keywords );

	this.callBack = callBack;

	this.onRStart = this.onRStart.bind( this );
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

	this.recognition.interimResults = true;
};

SpeedySpeech.isAvailable = Boolean( SpeechRecognition );

SpeedySpeech.prototype = {

	start: function() {

		if( !this.isRecognizing )
			this.recognition.start();
	},

	stop: function() {

		if( this.isRecognizing )
			this.recognition.abort();
	},

	setKeywords: function( keywords ) {

		this.keyLookup = {};

		for( var i = 0, len = keywords.length; i < len; i++ ) {
			
			this.keyLookup[ keywords[ i ] ] = true;
		}
	},

	onRStart: function() {

		this.isRecognizing = true;
	},

	onRResult: function( ev ) {

		var results = ev.results,
			resultPart, words, result, foundWord, confidence;

		for( var i = 0, len = results.length; !result && i < len; i++ ) {

			if( !results[ i ].isFinal ) { 

				for( var j = 0, lenJ = results[ i ].length; !result && j < lenJ; j++ ) {

					resultPart = results[ i ][ j ];
					words = resultPart.transcript.split( ' ' );

					for( var k = 0, lenK = words.length; !result && k < lenK; k++ ) {

						if( this.keyLookup[ words[ k ] ] ) {

							if( resultPart.confidence > this.keyWordConfidence ) {

								foundWord = words[ k ];
								result = resultPart.transcript;
								confidence = resultPart.confidence;

								this.stop();
							}
						}
					}
				} 
			} else {

				result = results[ i ][ 0 ].transcript;
				confidence = results[ i ][ 0 ].confidence;

				this.stop();
			}
		}

		if( result )
			this.callBack( undefined, result, confidence, foundWord );
	},

	onREnd: function() {

		this.isRecognizing = false;
	},

	onRError: function( err ) {

		if( err.error == 'not-allowed' ) {

			this.callBack( new Error( 'user denied speech recognition' ) );
		} else if( err.error == 'aborted' ) {

			this.isRecognizing = false;
		} else {

			this.callBack( err );
		}
	}
};

module.exports = SpeedySpeech;