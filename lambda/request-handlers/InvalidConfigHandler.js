const Alexa = require('ask-sdk-core');

/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');

// This handler responds when required environment variables
// missing or a .env file has not been created.

module.exports = {
    canHandle(handlerInput) {
        
      const attributes = handlerInput.attributesManager.getRequestAttributes();

      const invalidConfig = attributes.invalidConfig || false;
	  
	  return invalidConfig;
        
    },
    handle(handlerInput) {
        
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    const speakOutput = requestAttributes.t('ENV_NOT_CONFIGURED');

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
            
    }
};