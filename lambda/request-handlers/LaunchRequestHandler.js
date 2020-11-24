const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
const dotenv = require('dotenv');
require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');

module.exports = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
       	console.log(CONTA_ASSOCIADA);
		const resAuth = await SafraApi.autenticacaoPost();
		console.log(resAuth);
		var access_token = resAuth.access_token;
		const resAccount = await SafraApi.accountGet(access_token);
		console.log(resAccount);
		
		const speakOutput = CONTA_ASSOCIADA ? 'Bem vindo ' + resAccount.nickname + ', sou a ISA, assistente virtual do Banco Safra, no que posso ajudar?' : 
			'Bem vindo ' + resAccount.nickname + ', sou a ISA, assistente virtual do Banco Safra. Estou vendo que você é novo por aqui. Você já é cliente Safra?';
			
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
	   
		//const speakOutput = requestAttributes.t('GREETING', requestAttributes.t('SKILL_NAME'));
		const repromptOutput = requestAttributes.t('GREETING_REPROMPT');

		return handlerInput.responseBuilder
		  .speak(speakOutput)
		  .reprompt(repromptOutput)
		  .getResponse();
	    
    }
}