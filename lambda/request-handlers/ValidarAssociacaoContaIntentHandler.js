const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ValidarAssociacaoContaIntent';
    },
    handle(handlerInput) {
		CONTA_ASSOCIADA = 'true';
		Func.setContaAssociada(CONTA_ASSOCIADA);
		
		console.log(CONTA_ASSOCIADA);
		console.log(process.env.CONTA_ASSOCIADA);
		
		const speakOutput = 'Sua conta já foi validada com sucesso para utilizar a ISA. No que posso te ajudar?';

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt("O que deseja?")
			.getResponse();
    }
}