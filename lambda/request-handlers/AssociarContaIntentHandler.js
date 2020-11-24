const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
		return !CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
		&& ( Alexa.getIntentName(handlerInput.requestEnvelope) === 'AssociarContaIntent'
		 || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'
		 );
    },
    handle(handlerInput) {

		const speakOutput = 'Que legal! Caso você queira habilitar o seu acesso por aqui entre no seu canal digital e me ative no menu ISA. Tenho certeza que vou poder te ajudar muito mais no seu dia-a-dia.';
		
		return handlerInput.responseBuilder
				.speak(speakOutput)
				.reprompt("O que deseja fazer?")
				.getResponse();      
    }
}