const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
const dotenv = require('dotenv');
require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
		 return handlerInput.requestEnvelope.request.type === 'IntentRequest'
		 && handlerInput.requestEnvelope.request.intent.name === 'TransacaoIntent'
		 && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
    },
    handle(handlerInput) {

		const speakOutput = 'Ótimo, a palavra está correta. A transferência foi realizada com sucesso, estou enviando o comprovante para o seu e-mail.';
		
		return handlerInput.responseBuilder
		  .speak(speakOutput)
		  .reprompt("O que deseja fazer?")
		  .getResponse();        
    }
}