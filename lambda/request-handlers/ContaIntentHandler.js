const Alexa = require('ask-sdk-core');
const SafraApi = require('../safraApi');
//const dotenv = require('dotenv');
//require('dotenv').config();
const Func = require('../function');
var CONTA_ASSOCIADA = Func.getContaAssociada();

module.exports = {
    canHandle(handlerInput) {
          return CONTA_ASSOCIADA && Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'ContaIntent'
            || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AssociarContaIntent'
            );
    },
    async handle(handlerInput) {
		const resAuth = await SafraApi.autenticacaoPost();
		var access_token = resAuth.access_token;
		const resAccount = await SafraApi.accountGet(access_token);
		const resBalance = await SafraApi.balanceGet(access_token);
		
		const speakOutput = resAccount.nickname + ', seu saldo é de R$ ' + resBalance.amount.replace('.',',') + ' e voc? possui linha de crédito disponível de R$ ' +
							resBalance.creditlineAmount.replace('.',',') + ', posso te ajudar em algo mais?';

		return handlerInput.responseBuilder
				.speak(speakOutput)
				.reprompt("O que deseja fazer?")
				.getResponse();
    }
}