const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
//const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const ics = require('ics');
const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
const Func = require('../function');
const SafraApi = require('../safraApi');
const TIMEZONE = "America/Sao_Paulo";
let moment = require('moment-timezone');
//require('dotenv').config();

var CONTA_ASSOCIADA = Func.getContaAssociada();
/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');
/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env


// This handler is used to handle cases when a user asks if an
// appointment time is available
module.exports = {
   canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CheckAvailabilityIntent';
  },
  async handle(handlerInput) {
    const {
      responseBuilder,
      attributesManager,
    } = handlerInput;

    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

    // get timezone
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const userTimezone = TIMEZONE;//await upsServiceClient.getSystemTimeZone(deviceId);

    // get slots
    const appointmentDate = currentIntent.slots.appointmentDate;
    const appointmentTime = currentIntent.slots.appointmentTime;

    // format appointment date and time
    const dateLocal = luxon.DateTime.fromISO(appointmentDate.value, { zone: userTimezone });
    const timeLocal = luxon.DateTime.fromISO(appointmentTime.value, { zone: userTimezone });
    const dateTimeLocal = dateLocal.plus({ 'hours': timeLocal.hour, 'minute': timeLocal.minute || 0 });
    //const speakDateTimeLocal = dateTimeLocal.toLocaleString(luxon.DateTime.DATETIME_HUGE);
    const speakDateTimeLocal = dateTimeLocal.setLocale('en-gb').toLocaleString(luxon.DateTime.DATETIME_SHORT);

    // set appontement date to utc and add 30 min for end time
    const startTimeUtc = dateTimeLocal.toUTC().toISO();
    const endTimeUtc = dateTimeLocal.plus({ minutes: 30 }).toUTC().toISO();

    // check to see if the appointment date and time is available
    const isTimeSlotAvailable = await Func.checkAvailability(startTimeUtc, endTimeUtc, userTimezone);

    let speakOutput = requestAttributes.t('TIME_NOT_AVAILABLE', speakDateTimeLocal);
    let speekReprompt = requestAttributes.t('TIME_NOT_AVAILABLE_REPROMPT', speakDateTimeLocal);

    if (isTimeSlotAvailable) {
      // save booking time to session to be used for booking
      const sessionAttributes = {
        appointmentDate,
        appointmentTime,
      };

      attributesManager.setSessionAttributes(sessionAttributes);

      speakOutput = requestAttributes.t('TIME_AVAILABLE', speakDateTimeLocal);
      speekReprompt = requestAttributes.t('TIME_AVAILABLE_REPROMPT', speakDateTimeLocal);

      return responseBuilder
        .speak(speakOutput)
        .reprompt(speekReprompt)
        .getResponse();
    }

    return responseBuilder
      .speak(speakOutput)
      .reprompt(speekReprompt)
      .getResponse();
  },
};