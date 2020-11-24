const watsonApiKey = require('./credentials/watson-nlu.json').apikey;

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
 
const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: '2018-04-05',
  serviceUrl: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});


async function fetchWatsonAnalyze(sentence){
    return new Promise((resolve, reject ) => {
        nlu.analyze({
            text: sentence,
            features: {
                keywords: {},
                categories:{},
                sentiment: {}
            }
         }, (error, response) => {
             if (error){
                 throw error;
             }
             const watson = {};
             watson.keywords = response.result.keywords.map((keywords) => { return keywords.text.toLowerCase() });
             watson.sentiment = response.result.sentiment.document.label.toLowerCase();
             watson.categories = response.result.categories[0].label.toLowerCase();
            console.log(watson); 
            resolve(watson);
         })
    }); 
}

module.exports = {
    fetchWatsonAnalyze
};
