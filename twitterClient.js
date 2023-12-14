const { TwitterApi} = require("twitter-api-v2")
require("dotenv").config()

const appKey = process.env.Twitter_appKey;
const appSecret = process.env.Twitter_appSecret;
const accessToken = process.env.Twitter_accessToken;
const accessSecret = process.env.Twitter_accessSecret;


const client = new TwitterApi({
    appKey: appKey,
    appSecret: appSecret,
    accessToken: accessToken,
    accessSecret: accessSecret

})

const rwClient = client.readWrite

module.exports = rwClient
