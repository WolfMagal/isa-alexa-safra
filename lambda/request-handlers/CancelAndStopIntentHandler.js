const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
//const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const ics = require('ics');
//require('dotenv').config();
/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');
/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env

// This handler is used to handle 'no' utternaces
module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
      || handlerInput.requestEnvelope.request.intent.name ===  'AMAZON.StopIntent'
      ||  handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('CANCEL_STOP_RESPONSE');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};