var https = require('https');
const querystring = require('querystring');
var axios = require('axios');

function isDefaultErrorResponse(response) {
  return response.statusCode >= 500;
}

function defaultCartaoCallback(dataParser, req, resolve, reject){
  return function(error, responseBody, response) {
    if (error !== null && !response) {
      reject({ statusCode: 500, message: 'Internal Server Error', details: error.message });
    } else if (isDefaultErrorResponse(response)) {
      reject({ statusCode: response.res.statusCode, message: error.message, details: response.body});
    } else if(response.res.statusCode === 200 || response.res.statusCode === 204 ) {
      resolve(dataParser(response.body));
    } else if(response.res.statusCode === 404) {
      resolve([]);
    } else {
      reject({ statusCode: response.res.statusCode, message: 'An error ocurred', details: response.body});
    }
  };
}

function httpGet() {
  return new Promise(((resolve, reject) => {
    var options = {
        host: 'api.icndb.com',
        port: 443,
        path: '/jokes/random',
        method: 'GET',
    };
    
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}

function postAutenticacao() {
    return new Promise(((resolve, reject) => {
          var postData = querystring.stringify({
            'msg' : 'Hello World!'
        });
        var options = {
            method: 'POST',
            host: 'idcs-902a944ff6854c5fbe94750e48d66be5.identity.oraclecloud.com',
            path: '/oauth2/v1/token',
            port: 443,
            headers: {
                  'content-type': 'application/x-www-form-urlencoded',
                  'authorization': 'Basic OThiMmEwZDY0MWQ0NDFmZDhmMWQyOTdlNDg3NjFmMzk6ZDczMjU5YWYtYzJhZC00MTMzLWI0NjEtNDYyN2IwN2VlMDZj',
                  'cache-control': 'no-cache',
                  'postman-token': '280d6ac2-0e1c-d7ed-fc20-85de145f3d1c',
                  'Accept': '*/*',
                  'Accept-Encoding':'gzip, deflate, br',
                  'Connection': 'keep-alive',
                  'Host': '<calculated when request is sent>',
                  'Content-Length': '<calculated when request is sent>'
                },
            form: {
                  grant_type: 'client_credentials',
                  scope: 'urn:opc:resource:consumer::all'
                }
        };
        
        https.responseType="text";
        const request = https.request(options, (response) => {
         console.log('statusCode:', response.statusCode);
         console.log('headers:', response.headers);
         console.log('headers:', response.body);
          response.setEncoding('utf8');
          let returnData = '';
    
          response.on('data', (d) => {
             process.stdout.write(d);
          });
    
          response.on('end', () => {
            console.log(returnData);
            resolve(returnData);//JSON.parse(returnData));
          });
    
          response.on('error', (error) => {
            reject(error);
          });
        });
        request.write(postData);
        request.end();
    }));
}

async function autenticacaoPost() {
        //****************************
        var access_token = "";
        var nickname = "";
        var amount = 0;
        //****************************
        
        var dataToken = 'grant_type=client_credentials&scope=urn:opc:resource:consumer::all';
        
        var configToken = {
          method: 'post',
          url: 'https://idcs-902a944ff6854c5fbe94750e48d66be5.identity.oraclecloud.com/oauth2/v1/token',
          headers: { 
            'authorization': 'Basic OThiMmEwZDY0MWQ0NDFmZDhmMWQyOTdlNDg3NjFmMzk6ZDczMjU5YWYtYzJhZC00MTMzLWI0NjEtNDYyN2IwN2VlMDZj', 
            'cache-control': 'no-cache', 
            'content-type': 'application/x-www-form-urlencoded', 
            'postman-token': '280d6ac2-0e1c-d7ed-fc20-85de145f3d1c'
          },
          data : dataToken
        };
        
       let data;
       
       await axios(configToken)
        .then(function (response) {
          console.log('[TOKEN] -> SUCESSO ');
          response.access_token = response.data.access_token;
          console.log('[TOKEN] -> ' + response.access_token);
          data = response;
        })
        .catch(function (error) {
          console.log('[TOKEN] -> ERRO');
          console.log(error);
        });
        
        return data;
}

async function accountGet(access_token) {
    var configAccounts = {
      method: 'get',
      url: 'https://af3tqle6wgdocsdirzlfrq7w5m.apigateway.sa-saopaulo-1.oci.customer-oci.com/fiap-sandbox/open-banking/v1/accounts/00711234533',
      headers: { 
        'Authorization': 'Bearer ' + access_token
      }
    };
        
    let data;
    
   await axios(configAccounts)
    .then(function (response) {
      console.log('[ACCOUNTS] -> SUCESSO ');
      response.nickname = response.data.Data.Account[0].Nickname;
      data = response;
    })
    .catch(function (error) {
      console.log('[ACCOUNTS] -> ERRO');
      console.log(error);
    });
    
    return data;
}

async function balanceGet(access_token) {
    var configBalances = {
      method: 'get',
      url: 'https://af3tqle6wgdocsdirzlfrq7w5m.apigateway.sa-saopaulo-1.oci.customer-oci.com/fiap-sandbox/open-banking/v1/accounts/00711234533/balances',
      headers: { 
        'Authorization': 'Bearer ' + access_token
      }
    };
    
    console.log(access_token);
    let data;
    
    await axios(configBalances)
    .then(function (response) {
      console.log('[BALANCES] -> SUCESSO ');
      console.log(response.data.Data.Balance[0]);
      console.log(response.data.Data.Balance[0].CreditLine[0]);
      response.amount = response.data.Data.Balance[0].Amount.Amount;
      console.log(response.data.Data.Balance[0].CreditLine[0].Amount.Amount);
      response.creditlineAmount = response.data.Data.Balance[0].CreditLine[0].Amount.Amount;
      data = response;
    })
    .catch(function (error) {
      console.log('[BALANCES] -> ERRO');
    });
        
    return data;
}


module.exports = {
    httpGet,
    postAutenticacao,
    autenticacaoPost,
    accountGet,
    balanceGet
};
