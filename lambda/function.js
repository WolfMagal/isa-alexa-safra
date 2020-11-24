const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const luxon = require('luxon');
const ics = require('ics');
const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');
const SafraApi = require('./safraApi');
const TIMEZONE = "America/Sao_Paulo";
let moment = require('moment-timezone');
require('dotenv').config();
var CONTA_ASSOCIADA = SafraApi.contaGet();//process.env.CONTA_ASSOCIADA === 'true';

/* LANGUAGE STRINGS */
const languageStrings = require('./languages/languageStrings');

/* FUNCTIONS */

// A function that usess the Google Calander API and the freebusy service
// to check if a given appointment time slot is available
function checkAvailability(startTime, endTime, timezone) {
  const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URIS,
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    TOKEN_TYPE,
    EXPIRE_DATE,
    SCOPE,
  } = process.env;

  return new Promise(((resolve, reject) => {
    // Setup oAuth2 client
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS);
    const tokens = {
      access_token: ACCESS_TOKEN,
      scope: SCOPE,
      token_type: TOKEN_TYPE,
      expiry_date: EXPIRE_DATE,
    };

    if (REFRESH_TOKEN) tokens.refresh_token = REFRESH_TOKEN;

    oAuth2Client.credentials = tokens;

    // Create a Calendar instance
    const Calendar = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    /** RequestBody
     * @items Array [{id : "<email-address>"}]
     * @timeMax String 2020-06-17T15:30:00.000Z
     * @timeMin String 2020-06-17T15:00:00.000Z
     * @timeZone String America/New_York
     */

    // Setup request body
    const query = {
      items: [
        {
          id: process.env.NOTIFY_EMAIL,
        },
      ],
      timeMin: startTime,
      timeMax: endTime,
      timeZone: timezone,
    };

    Calendar.freebusy.query({
      requestBody: query,
    }, (err, resp) => {
      if (err) {
        reject(err);
      } else if (resp.data.calendars[process.env.NOTIFY_EMAIL].busy
        && resp.data.calendars[process.env.NOTIFY_EMAIL].busy.length > 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  }));
}

// This function processes a booking request by creating a .ics file,
// saving the .isc file to S3 and sending it via email to the skill ower.
function bookAppointment(handlerInput) {
  return new Promise(((resolve, reject) => {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    try {
      const appointmentData = sessionAttributes.appointmentData;
      const userTime = luxon.DateTime.fromISO(appointmentData.appointmentDateTime,
        { zone: appointmentData.userTimezone });
      const userTimeUtc = userTime.setZone('utc');

      // create .ics
      const event = {
        start: [
          userTimeUtc.year,
          userTimeUtc.month,
          userTimeUtc.day,
          userTimeUtc.hour,
          userTimeUtc.minute,
        ],
        startInputType: 'utc',
        endInputType: 'utc',
        productId: 'dabblelab/ics',
        duration: { hours: 0, minutes: 30 },
        title: appointmentData.title,
        description: appointmentData.description,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
        attendees: [
          {
            name: appointmentData.profileName,
            email: appointmentData.profileEmail,
            rsvp: true,
            partstat: 'ACCEPTED',
            role: 'REQ-PARTICIPANT',
          },
        ],
      };

      const icsData = ics.createEvent(event);

      // save .ics to s3
      const s3 = new AWS.S3();

      const s3Params = {
        Body: icsData.value,
        Bucket: process.env.S3_PERSISTENCE_BUCKET,
        Key: `appointments/${appointmentData.appointmentDate}/${event.title.replace(/ /g, '-')
          .toLowerCase()}-${luxon.DateTime.utc().toMillis()}.ics`,
      };

      s3.putObject(s3Params, () => {
        // send email to user
        
        if ( process.env.SEND_EMAIL === 'true' ) {
          console.log('DEGUB ' + typeof process.env.SEND_EMAIL)
          const attachment = Buffer.from(icsData.value);
          
          const msg = {
            to: [process.env.NOTIFY_EMAIL, appointmentData.profileEmail],
            from: process.env.FROM_EMAIL,
            subject: requestAttributes.t('EMAIL_SUBJECT', appointmentData.profileName, process.env.FROM_NAME),
            text: requestAttributes.t('EMAIL_TEXT',
              appointmentData.profileName,
              process.env.FROM_NAME,
              appointmentData.profileMobileNumber),
            attachments: [
              {
                content: attachment.toString('base64'),
                filename: 'appointment.ics',
                type: 'text/calendar',
                disposition: 'attachment',
              },
            ],
          };
  
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          sgMail.send(msg).then((result) => {
            // mail done sending
            resolve(result);
          });
          
        } else {
          resolve(true);
        }
      });
    } catch (ex) {
      console.log(`bookAppointment() ERROR: ${ex.message}`);
      reject(ex);
    }
  }));
}


function getContaAssociada() {
    return  CONTA_ASSOCIADA;//process.env.CONTA_ASSOCIADA === 'true';/// CONTA_ASSOCIADA = CONTA_ASSOCIADA === 'true';
}

function setContaAssociada(valor) {
    CONTA_ASSOCIADA =  (valor === 'true') ? true : false; // process.env.CONTA_ASSOCIADA = (valor === 'true') ? 'true' : 'false';// CONTA_ASSOCIADA = valor;
}



module.exports = {
    checkAvailability,
    bookAppointment,
    getContaAssociada,
    setContaAssociada
};
