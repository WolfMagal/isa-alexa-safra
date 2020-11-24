const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const WatsonApi = require('../watsonApi');


/* CONSTANTS */
// To set constants, change the value in .env.sample then
// rename .env.sample to just .env

/* LANGUAGE STRINGS */
const languageStrings = require('../languages/languageStrings');

/* HANDLERS */

// This interceptor function is used for localization.
// It uses the i18n module, along with defined language
// string to return localized content. It defaults to 'en'
// if it can't find a matching language.
module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
     && handlerInput.requestEnvelope.request.intent.name === 'FAQIntent'
  },
  async handle(handlerInput) {
    var slotValue = handlerInput.requestEnvelope.request.intent.slots.Query.value;
    console.log(slotValue);
    const watsonDiscovery = await WatsonApi.fetchWatsonDiscovery(slotValue);
    console.log(watsonDiscovery);
    const watson = await WatsonApi.fetchWatsonAnalyze(slotValue);
    console.log(watson);
    let speakOutput = '';
    if (watsonDiscovery && watsonDiscovery !== null){
         speakOutput = watsonDiscovery;
    }
    else if (watson.keywords.includes("ted")){
         speakOutput = 'Você pode realizar TED até ás 17:00h. Mas é possível realizar a transferência via PIX, vi que você já possui cadastro realizado. Se desejar transferir, diga PIX.';
    }
    else if (watson.keywords.includes("doc")){
         speakOutput = 'Você pode realizar DOC até ás 20:00h. Mas é possível realizar a transferência via PIX, vi que você já possui cadastro realizado. Se desejar transferir, diga PIX.';
    }
    else if (watson.sentiment === 'positive'){
         speakOutput = 'Que bacana! Verifiquei que você está bastante contente, sempre que precisar pode contar comigo. Sempre bom ouvir esse feedback.';
    }
    else if (watson.sentiment === 'negative'){
         speakOutput = 'Obrigado por sua colocação. Sugestões anotadas.';
    }
    else{
         speakOutput = "Boa colocação. Esse é um ponto que vamos adicionar como melhoria, infelizmente ainda não temos uma resposta para essa questão."
    }
   
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("No que mais posso te ajudar?")
      .getResponse();
  },
}
