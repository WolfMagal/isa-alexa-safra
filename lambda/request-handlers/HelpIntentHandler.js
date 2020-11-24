const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
require('dotenv').config();

var CONTA_ASSOCIADA = process.env.CONTA_ASSOCIADA === 'true';
/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');
/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env

module.exports = {
    canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('HELP');
    const repromptOutput = requestAttributes.t('HELP_REPROMPT');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
}