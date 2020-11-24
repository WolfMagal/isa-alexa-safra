const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
require('dotenv').config();

/* LANGUAGE STRINGS */
const languageStrings = require('./languages/languageStrings');

//Launch module
const LaunchRequestHandler = require('./request-handlers/LaunchRequestHandler');

//Custom modules
const TransacaoIntentHandler = require('./request-handlers/TransacaoIntentHandler');
const MorningCallsIntentHandler = require('./request-handlers/MorningCallsIntentHandler');
const FAQIntentHandler = require('./request-handlers/FAQIntentHandler');
const AssociarContaIntentHandler = require('./request-handlers/AssociarContaIntentHandler');
const AssociarNovaContaIntentHandler = require('./request-handlers/AssociarNovaContaIntentHandler');
const AssociarContaQueroSerSafraIntentHandler = require('./request-handlers/AssociarContaQueroSerSafraIntentHandler');
const ContaAssociadaSafraIntentHandler = require('./request-handlers/ContaAssociadaSafraIntentHandler');
const AssociarContaSaberMaisIntentHandler = require('./request-handlers/AssociarContaSaberMaisIntentHandler');
const ValidarAssociacaoContaIntentHandler = require('./request-handlers/ValidarAssociacaoContaIntentHandler');
const ContaIntentHandler = require('./request-handlers/ContaIntentHandler');
const ContaNaoAssociadaIntentHandler = require('./request-handlers/ContaNaoAssociadaIntentHandler');
const StartedInProgressScheduleAppointmentIntentHandler = require('./request-handlers/StartedInProgressScheduleAppointmentIntentHandler');
const CompletedScheduleAppointmentIntentHandler = require('./request-handlers/CompletedScheduleAppointmentIntentHandler');
const CheckAvailabilityIntentHandler = require('./request-handlers/CheckAvailabilityIntentHandler');

//Default modules
const FallbackIntentHandler = require('./request-handlers/FallbackIntentHandler');
const YesIntentHandler = require('./request-handlers/YesIntentHandler');
const NoIntentHandler = require('./request-handlers/NoIntentHandler');
const HelpIntentHandler = require('./request-handlers/HelpIntentHandler');
const CancelAndStopIntentHandler = require('./request-handlers/CancelAndStopIntentHandler');
const SessionEndedRequestHandler = require('./request-handlers/SessionEndedRequestHandler');
const IntentReflectorHandler = require('./request-handlers/IntentReflectorHandler');
const ErrorHandler = require('./request-handlers/ErrorHandler');
const InvalidConfigHandler = require('./request-handlers/InvalidConfigHandler');
const InvalidPermissionsHandler = require('./request-handlers/InvalidPermissionsHandler');

//Interceptor modules
//const EnvironmentCheckInterceptor = require('./request-handlers/EnvironmentCheckInterceptor');
//const PermissionsCheckInterceptor = require('./request-handlers/PermissionsCheckInterceptor');
//const LocalizationInterceptor = require('./request-handlers/LocalizationInterceptor');

/* INTERCEPTORS */

// This function checks to make sure required environment vairables
// exists. This function will only be called if required configuration
// is not found. So, it's just a utilty function and it is not used
// after the skill is correctly configured.
const EnvironmentCheckInterceptor = {
  process(handlerInput) {
    // load environment variable from .env
    dotenv.config();

    // check for process.env.S3_PERSISTENCE_BUCKET
    if (!process.env.S3_PERSISTENCE_BUCKET) {
      handlerInput.attributesManager.setRequestAttributes({ invalidConfig: true });
    }
  },
};

// This interceptor function checks to see if a user has enabled permissions
// to access their profile information. If not, a request attribute is set and
// and handled by the InvalidPermissionsHandler
const PermissionsCheckInterceptor = {
  async process(handlerInput) {
    const { serviceClientFactory, attributesManager } = handlerInput;

    try {
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();

      const profileName = await upsServiceClient.getProfileName();
      const profileEmail = await upsServiceClient.getProfileEmail();
      const profileMobileNumber = await upsServiceClient.getProfileMobileNumber();

      if (!profileName) {
        // no profile name
        attributesManager.setRequestAttributes({ permissionsError: 'no_name' });
      }

      if (!profileEmail) {
        // no email address
        attributesManager.setRequestAttributes({ permissionsError: 'no_email' });
      }

      if (!profileMobileNumber) {
        // no mobile number
        attributesManager.setRequestAttributes({ permissionsError: 'no_phone' });
      }
    } catch (error) {
      if (error.statusCode === 403) {
        // permissions are not enabled
        attributesManager.setRequestAttributes({ permissionsError: 'permissions_required' });
      }
    }
  },
};

// This interceptor function is used for localization.
// It uses the i18n module, along with defined language
// string to return localized content. It defaults to 'en'
// if it can't find a matching language.
const LocalizationInterceptor = {
  process(handlerInput) {
    const { requestEnvelope, attributesManager } = handlerInput;

    const localizationClient = i18n.use(sprintf).init({
      lng: requestEnvelope.request.locale,
      fallbackLng: 'en-US',
      resources: languageStrings,
    });

    localizationClient.localize = (...args) => {
      // const args = arguments;
      const values = [];

      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }
      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });

      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };

    const attributes = attributesManager.getRequestAttributes();
    attributes.t = (...args) => localizationClient.localize(...args);
  },
};


//Add modules on lambda function

/* LAMBDA SETUP */

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    InvalidConfigHandler,
    InvalidPermissionsHandler,
    LaunchRequestHandler,
    MorningCallsIntentHandler,
    FAQIntentHandler,
    TransacaoIntentHandler,
    AssociarContaIntentHandler,
    AssociarNovaContaIntentHandler,
    AssociarContaQueroSerSafraIntentHandler,
    ContaAssociadaSafraIntentHandler,
    AssociarContaSaberMaisIntentHandler,
    ValidarAssociacaoContaIntentHandler,
    ContaIntentHandler,
    ContaNaoAssociadaIntentHandler,
    FallbackIntentHandler,
    StartedInProgressScheduleAppointmentIntentHandler,
    CompletedScheduleAppointmentIntentHandler,
    CheckAvailabilityIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
  )
  .addRequestInterceptors(
    EnvironmentCheckInterceptor,
    PermissionsCheckInterceptor,
    LocalizationInterceptor,
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
