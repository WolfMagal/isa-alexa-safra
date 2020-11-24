const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
        return !CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            &&  handlerInput.requestEnvelope.request.intent.name === 'AssociarContaSaberMaisIntent';
    },
    handle(handlerInput) {
		const speakOutput = 'O Safra te convida a pensar. E o daqui pra frente? Um lugar onde se sente seguro, é um bom lugar daqui pra frente. Cuidar mais das pessoas, das suas escolhas. Entender que valores importam. Detalhes fazem a diferença. O Safra está a 175 anos pensando sério no daqui para frente! Abra sua conta, invista como especialista. Diga quero ser SAFRA!';

		return handlerInput.responseBuilder
				.speak(speakOutput)
				.reprompt("O que deseja fazer?")
				.getResponse();
    }
}