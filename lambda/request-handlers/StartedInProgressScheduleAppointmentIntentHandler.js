const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const ics = require('ics');
const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
const SafraApi = require('../safraApi');
const TIMEZONE = "America/Sao_Paulo";
let moment = require('moment-timezone');
require('dotenv').config();

const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env

/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');

module.exports = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
		return request.type === 'IntentRequest'
		  && request.intent.name === 'ScheduleAppointmentIntent'
		  && request.dialogState !== 'COMPLETED';
    },
    async handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
		const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

		// get timezone
		const { deviceId } = handlerInput.requestEnvelope.context.System.device;
		const userTimezone = TIMEZONE;//await upsServiceClient.getSystemTimeZone(deviceId);

		// get slots
		const appointmentDate = currentIntent.slots.appointmentDate;
		const appointmentTime = currentIntent.slots.appointmentTime;

		// we have an appointment date and time
		if (appointmentDate.value && appointmentTime.value) {
		// format appointment date
		const dateLocal = luxon.DateTime.fromISO(appointmentDate.value, { zone: userTimezone });
		const timeLocal = luxon.DateTime.fromISO(appointmentTime.value, { zone: userTimezone });
		const dateTimeLocal = dateLocal.plus({ 'hours': timeLocal.hour, 'minute': timeLocal.minute });
		const speakDateTimeLocal = dateTimeLocal.setLocale('en-gb').toLocaleString(luxon.DateTime.DATETIME_SHORT);

		// custom intent confirmation for ScheduleAppointmentIntent
		if (currentIntent.confirmationStatus === 'NONE'
		&& currentIntent.slots.appointmentDate.value
		&& currentIntent.slots.appointmentTime.value) {
		const speakOutput = requestAttributes.t('APPOINTMENT_CONFIRM', process.env.FROM_NAME, speakDateTimeLocal);
		const repromptOutput = requestAttributes.t('APPOINTMENT_CONFIRM_REPROMPT', process.env.FROM_NAME, speakDateTimeLocal);

		return handlerInput.responseBuilder
		  .speak(speakOutput)
		  .reprompt(repromptOutput)
		  .addConfirmIntentDirective()
		  .getResponse();
		}
		}

		return handlerInput.responseBuilder
		.addDelegateDirective(currentIntent)
		.getResponse();
    }
}