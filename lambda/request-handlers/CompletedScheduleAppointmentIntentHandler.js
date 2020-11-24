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


// Handles the completion of an appointment. This handler is used when
// dialog in ScheduleAppointmentIntent is completed.
module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ScheduleAppointmentIntent'
      && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
  },
  async handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

    // get timezone
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const userTimezone = TIMEZONE;//await upsServiceClient.getSystemTimeZone(deviceId);
    // const userTimezone = 'Asia/Yerevan';

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

    // get user profile details
    const mobileNumber = await upsServiceClient.getProfileMobileNumber();
    const profileName = await upsServiceClient.getProfileName();
    const profileEmail = await upsServiceClient.getProfileEmail();

    // deal with intent confirmation denied
    if (currentIntent.confirmationStatus === 'DENIED') {
      const speakOutput = requestAttributes.t('NO_CONFIRM');
      const repromptOutput = requestAttributes.t('NO_CONFIRM_REPROMPT');

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }

    // params for booking appointment
    const appointmentData = {
      title: requestAttributes.t('APPOINTMENT_TITLE', profileName),
      description: requestAttributes.t('APPOINTMENT_DESCRIPTION', profileName),
      appointmentDateTime: dateTimeLocal,
      userTimezone,
      appointmentDate: appointmentDate.value,
      appointmentTime: appointmentTime.value,
      profileName,
      profileEmail,
      profileMobileNumber: `+${mobileNumber.countryCode}${mobileNumber.phoneNumber}`,
    };

    sessionAttributes.appointmentData = appointmentData;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // schedule without freebusy check
    if ( process.env.CHECK_FREEBUSY === 'false' ) {
      await Func.bookAppointment(handlerInput);

      const speakOutput = requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal);

      return handlerInput.responseBuilder
        .withSimpleCard(
          requestAttributes.t('APPOINTMENT_TITLE', process.env.FROM_NAME),
          requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal),
        )
        .speak(speakOutput)
        .getResponse();
    } else if ( process.env.CHECK_FREEBUSY === 'true' ) {

      // check if the request time is available
      const isTimeSlotAvailable = await Func.checkAvailability(startTimeUtc, endTimeUtc, userTimezone);

      // schedule with freebusy check
      if (isTimeSlotAvailable) {
        await Func.bookAppointment(handlerInput);

        const speakOutput = requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal);

        return handlerInput.responseBuilder
          .withSimpleCard(
            requestAttributes.t('APPOINTMENT_TITLE', process.env.FROM_NAME),
            requestAttributes.t('APPOINTMENT_CONFIRM_COMPLETED', process.env.FROM_NAME, speakDateTimeLocal),
          )
          .speak(speakOutput)
          .getResponse();
      }

      // time requested is not available so prompt to pick another time
      const speakOutput = requestAttributes.t('TIME_NOT_AVAILABLE', speakDateTimeLocal);
      const speakReprompt = requestAttributes.t('TIME_NOT_AVAILABLE_REPROMPT', speakDateTimeLocal);

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakReprompt)
        .getResponse();
    }
  }
};