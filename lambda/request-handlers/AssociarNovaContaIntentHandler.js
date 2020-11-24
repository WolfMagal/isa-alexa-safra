const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
		 return !CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            &&  handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {

		 const speakOutput = 'Você sabia que o Safra se preocupa com segurança e no daqui pra frente. Gostaria de tornar-se um cliente Safra já ou prefere saber mais sobre a gente?';
    
		return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("O que deseja fazer?")
            .getResponse();   
    }
}