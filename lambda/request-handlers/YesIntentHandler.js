const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const ics = require('ics');
const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();
/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');
/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env

// This handler is used to handle 'yes' utternaces
module.exports = {
   canHandle(handlerInput) {
    return CONTA_ASSOCIADA && handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('SCHEDULE_YES');

    return handlerInput.responseBuilder
      .addDelegateDirective({
        name: 'ScheduleAppointmentIntent',
        confirmationStatus: 'NONE',
        slots: {},
      })
      .speak(speakOutput)
      .getResponse();
  },
};