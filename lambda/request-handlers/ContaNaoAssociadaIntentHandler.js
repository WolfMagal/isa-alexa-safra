const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
      canHandle(handlerInput) {
        return !CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContaIntent';
    },
  async handle(handlerInput) {
    console.log(CONTA_ASSOCIADA);
    const speakOutput = 'Sua conta ainda não está associada. Diga validar, para verificar se já é possível associar e começar a utilizar a ISA.';

    return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("O que deseja fazer?")
            .getResponse();
    }
}