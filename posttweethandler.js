const got = require('got');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const qs = require('querystring');
const propReader = require('properties-reader');


const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

class PostTweetHandler {
// The code below sets the consumer key and consumer secret from your environment variables
        // To set environment variables on macOS or Linux, run the export commands below from the terminal:
        // export CONSUMER_KEY='YOUR-KEY'
        // export CONSUMER_SECRET='YOUR-SECRET'
        //const consumer_key = process.env.CONSUMER_KEY;
        //const consumer_secret = process.env.CONSUMER_SECRET;
        constructor() {
            this.props = propReader('config/twitter_api.properties');
            this.consumer_key = this.props.get("CONSUMER_KEY");
            this.consumer_secret = this.props.get("CONSUMER_SECRET");
            // Be sure to add replace the text of the with the text you wish to Tweet.
            // You can also add parameters to post polls, quote Tweets, Tweet with reply settings, and Tweet to Super Followers in addition to other features.
            this.data = {
              "text": "Test create tweet API"
            };
            
            this.endpointURL = `https://api.twitter.com/2/tweets`;
            
            // this example uses PIN-based OAuth to authorize the user
            this.requestTokenURL = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write';
            this.authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
            this.accessTokenURL = 'https://api.twitter.com/oauth/access_token';
            this.oauth = OAuth({
              consumer: {
                key: this.consumer_key,
                secret: this.consumer_secret
              },
              signature_method: 'HMAC-SHA1',
              hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
            });
        }
         
    
    async input (prompt) {
      return new Promise(async (resolve, reject) => {
        readline.question(prompt, (out) => {
          readline.close();
          resolve(out);
        });
      });
    }
    
    async requestToken () {
      const authHeader = this.oauth.toHeader(this.oauth.authorize({
        url: this.requestTokenURL,
        method: 'POST'
      }));
    
      const req = await got.post(this.requestTokenURL, {
        headers: {
          Authorization: authHeader["Authorization"]
        }
      });
      if (req.body) {
        return qs.parse(req.body);
      } else {
        throw new Error('Cannot get an OAuth request token');
      }
    };
    
    
    async accessToken ({
      oauth_token,
      oauth_token_secret
    }, verifier) {
      const authHeader = this.oauth.toHeader(this.oauth.authorize({
        url: this.accessTokenURL,
        method: 'POST'
      }));
      const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`
      const req = await got.post(path, {
        headers: {
          Authorization: authHeader["Authorization"]
        }
      });
      if (req.body) {
        return qs.parse(req.body);
      } else {
        throw new Error('Cannot get an OAuth request token');
      }
    };
    
    
    async getRequest ({
      oauth_token,
      oauth_token_secret
    }) {
    
      const token = {
        key: oauth_token,
        secret: oauth_token_secret
      };
    
      const authHeader = this.oauth.toHeader(this.oauth.authorize({
        url: endpointURL,
        method: 'POST'
      }, token));
    
      const req = await got.post(this.endpointURL, {
        json: this.data,
        responseType: 'json',
        headers: {
          Authorization: authHeader["Authorization"],
          'user-agent': "v2CreateTweetJS",
          'content-type': "application/json",
          'accept': "application/json"
        }
      });
      if (req.body) {
        return req.body;
      } else {
        throw new Error('Unsuccessful request');
      }
    };
    
    async postTweet (){
      try {
        // Get request token
        const oAuthRequestToken = await requestToken();
        // Get authorization
        authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);

        console.log('Please go here and authorize:', authorizeURL.href);
    
        const pin = await input('Paste the PIN here: ');
        // Get the access token
        const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());
        // Make the request
        const response = await getRequest(oAuthAccessToken);
        console.dir(response, {
          depth: null
        });
      } catch (e) {
        console.log(e);
        //process.exit(-1);
      }
      //process.exit();
    };
};

module.exports = PostTweetHandler;
