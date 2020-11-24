const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
		 return !CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            &&  handlerInput.requestEnvelope.request.intent.name === 'AssociarContaQueroSerSafraIntent';
    },
    handle(handlerInput) {

		const speakOutput = 'Ótima escolha. Enviamos no seu e-mail um passo a passo para abertura da sua conta. Lembrando que você pode realizar todo esse processo de maneira digital no conforto da sua casa. Mas qualquer dúvida estou aqui pra te ajudar.';

		return handlerInput.responseBuilder
				.speak(speakOutput)
				.reprompt("O que deseja fazer?")
				.getResponse();  
    }
}