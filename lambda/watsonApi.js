const watsonApiKey = require('./credentials/watson-nlu.json').apikey;

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const watsonDiscoveryApiKey = require('./credentials/watson-discovery.json').apikey;
const DiscoveryV1 = require('ibm-watson/discovery/v1');
 
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


async function fetchWatsonDiscovery(sentence){
    return new Promise((resolve, reject ) => {
        
        const discovery = new DiscoveryV1({
          version: '2019-04-30',
          authenticator: new IamAuthenticator({
            apikey: watsonDiscoveryApiKey,
          }),
          serviceUrl: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/25387b80-1bf6-438f-8c3f-f678b2970ac5',
        });
        
        const queryParams = {
            environmentId: 'fa39d097-a23b-4d24-b7cc-1424d10dfc59',
            collectionId: '8cbee36b-f57a-4ab4-8c37-3b6bc4cdf5f4',
            naturalLanguageQuery: sentence,
            passages: true, 
            count:3, 
            passages_count:3
        };
        
        discovery.query(queryParams)
          .then(queryResponse => {
        
            var qResponse = queryResponse.result['results'].filter(x => x.question);
            if (Array.isArray(qResponse) && qResponse[0].answer && Array.isArray(qResponse[0].answer)){
                resolve(qResponse[0].answer[0]);
            }
           else{
               resolve(null);
           }
          })
          .catch(err => {
            console.log('error:', err);
          });
    }); 
}

module.exports = {
    fetchWatsonAnalyze,
    fetchWatsonDiscovery
};
