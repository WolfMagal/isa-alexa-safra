const Alexa = require('ask-sdk-core');

/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');

// This is a handler that is used when the user has not enabled the
// required permissions.
module.exports = {
    canHandle(handlerInput) {
        
		const attributes = handlerInput.attributesManager.getRequestAttributes();

		return attributes.permissionsError;
        
    },
    handle(handlerInput) {
        
	const attributes = handlerInput.attributesManager.getRequestAttributes();

		switch (attributes.permissionsError) {
		  case 'no_name':
			return handlerInput.responseBuilder
			  .speak(attributes.t('NAME_REQUIRED'))
			  .withSimpleCard(attributes.t('SKILL_NAME'), attributes.t('NAME_REQUIRED_REPROMPT'))
			  .getResponse();
		  case 'no_email':
			return handlerInput.responseBuilder
			  .speak(attributes.t('EMAIL_REQUIRED'))
			  .withSimpleCard(attributes.t('SKILL_NAME'), attributes.t('EMAIL_REQUIRED_REPROMPT'))
			  .getResponse();
		  case 'no_phone':
			return handlerInput.responseBuilder
			  .speak(attributes.t('PHONE_REQUIRED'))
			  .withSimpleCard(attributes.t('SKILL_NAME'), attributes.t('PHONE_REQUIRED_REPROMPT'))
			  .getResponse();
		  case 'permissions_required':
			return handlerInput.responseBuilder
			  .speak(attributes.t('PERMISSIONS_REQUIRED', attributes.t('SKILL_NAME')))
			  .withAskForPermissionsConsentCard(['alexa::profile:email:read', 'alexa::profile:name:read', 'alexa::profile:mobile_number:read'])
			  .getResponse();
		  default:
			// throw an error if the permission is not defined
			throw new Error(`${attributes.permissionsError} is not a known permission`);
		}		
    },
};