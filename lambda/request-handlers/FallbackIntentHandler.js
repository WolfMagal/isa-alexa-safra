const Alexa = require('ask-sdk-core');

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
**/

module.exports = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
		const speakOutput = 'Opa, não entendi. Posso te dar dicas de investimento, respondo suas dúvidas, facilitar suas transações, te aproximo do banco de uma maneira simples e descomplicada. Queremos mais que somente te atender, queremos te OUVIR. No que posso te ajudar?';
		
		const reprompt = 'O que deseja?';
	  	  
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(reprompt)
            .getResponse();
    }
}