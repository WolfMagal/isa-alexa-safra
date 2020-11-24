const Alexa = require('ask-sdk-core');

module.exports = {
    canHandle(handlerInput) {
        
        //From MorningCalls intent
        return Alexa.getIntentName(handlerInput.requestEnvelope) === 'MorningCallsIntent';
        
    },
    async handle(handlerInput) {
        
		var audio = '<audio src="https://www.jovo.tech/audio/D2C9PDBc-morningcallsafra.mp3" />';
		const speakOutput = 'Ouça a notícia mais atual: ' + audio;

		return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
            
    }
};