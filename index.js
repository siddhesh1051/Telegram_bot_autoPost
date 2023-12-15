const rwClient = require("./twitterClient.js");
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const Linkedin = require('node-linkedin')(`${process.env.Linkedin_Client_ID}`, `${process.env.Linkedin_Client_Secret}`);
require('dotenv').config();

const Linkedin_AccessToken = process.env.Linkedin_AccessToken;
var linkedin = Linkedin.init(`${Linkedin_AccessToken}`);
const URN_ID = process.env.Linkedin_URN_ID;

const botToken = `${process.env.BOT_TOKEN}`;
const channelId = `${process.env.Telegram_Channel_ID}`;

const bot = new TelegramBot(botToken, { polling: true });

bot.on('message', (msg) => {
  try {
      const chatId = msg.chat.id;
      if(msg.text === '/start'){
        bot.sendMessage(chatId, 'Welcome to Hyreme Bot! \n\nYou can send a message to all the members of the group by sending a message to this bot. \n\nPlease note that the message will be sent to all the members of the group and the message will be posted on all the social media platforms. \n\nPlease do not spam the group. \n\nThank you! \n\nRegards, \nHyreme Team');

      }
      else{
        bot.sendMessage(chatId, 'Sending message to everywhere. Please wait...');
        tweet(chatId, msg.text);
        sendTelegramMessage(chatId, msg.text);
        sendLinkedinPost(chatId,msg.text, Linkedin_AccessToken);
      }

  } catch (e) {
    bot.sendMessage(chatId, 'Error sending message. Please try again.');
  }
});

const tweet = async (chatId, text) => {
  try {
    const tweet = await rwClient.v2.tweet(text);
    await bot.sendMessage(chatId, 'Tweet sent successfully!');

  } catch (e) {
    if (e?.code === 429) {
      bot.sendMessage(chatId, 'You have reached your daily tweet limit. Please try again tomorrow.');
    }
    else if(e?.code === 186){
          bot.sendMessage(chatId, 'Tweet is too long. making it shorter and trying again.');
          tweet(chatId, text.replace(/🚀 Explore instant job and internship updates on our Telegram & WhatsApp Groups!\n🔗 Link to Join: https:\/\/linktr.ee\/hyreme/, ''));
    }
    else {
      bot.sendMessage(chatId, 'Error sending tweet. Please try again.');
    }    
  }
};

const sendTelegramMessage = async (chatId,text) => {
  try {
    await bot.sendMessage(channelId, text).then((message) => {
      bot.sendMessage(chatId, 'Telegram successfull!');
    })
  } catch (e) {
    bot.sendMessage(chatId, 'Error sending telegram message. Please try again.');
  }
};

const sendLinkedinPost = async (chatId,textMessage, accessToken) => {
  try {
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${URN_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: textMessage,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    ).then((response) => {
      bot.sendMessage(chatId, 'LinkedIn successfull!');
    });

  } catch (error) {
    bot.sendMessage(chatId, 'Error sending linkedin post. Please try again.');  
    console.log(error);
  }
};


//old code

// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   const opts = {
//     reply_markup: {
//       inline_keyboard: [[{ text: 'Send Group Message', callback_data: 'tweetButton' }]],
//     },
//   };
//   bot.sendMessage(chatId, 'Press the button below to send a tweet:', opts);
// });

// bot.onText(/\/tweet/, (msg) => {
//   const chatId = msg.chat.id;
//   const opts = {
//     reply_markup: {
//       inline_keyboard: [[{ text: 'Tweet', callback_data: 'tweetButton' }]],
//     },
//   };
//   bot.sendMessage(chatId, 'Press the button below to send a Message:', opts);
// });

// bot.on('callback_query', (query) => {
//   if (query.data === 'tweetButton') {
//     bot.answerCallbackQuery(query.id);
//     bot.sendMessage(query.message.chat.id, 'Enter your message text:');
//     bot.once('message', (message) => {
//       //tweet fuction
//       tweet(query.message.chat.id, message.text);
//       //send telegram message
//       // sendTelegramMessage(message.text);
//       //send linkedin post
//       // sendLinkedinPost(message.text, Linkedin_AccessToken);

//     });
//   }
// });
