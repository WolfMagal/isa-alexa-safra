const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
        return CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            &&  handlerInput.requestEnvelope.request.intent.name === 'AssociarContaQueroSerSafraIntent';
    },
    handle(handlerInput) {

		const speakOutput = 'Opa, sua conta já está ativa. O que deseja?';
    
		return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("O que deseja fazer?")
            .getResponse();
    }
}