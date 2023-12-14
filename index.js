const rwClient = require("./twitterClient.js");
const TelegramBot = require('node-telegram-bot-api');



const Linkedin = require('node-linkedin')('77vianum2tz402', 'n5NFrr9jsXaTWQPu', 'http://localhost:3000/callback');
require('dotenv').config();

const Linkedin_AccessToken = process.env.Linkedin_AccessToken;
var linkedin = Linkedin.init(`${Linkedin_AccessToken}`);

const botToken = `${process.env.BOT_TOKEN}`;
const channelId = `${process.env.Telegram_Channel_ID}`;

const bot = new TelegramBot(botToken, { polling: true });


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const opts = {
    reply_markup: {
      inline_keyboard: [[{ text: 'Send Group Message', callback_data: 'tweetButton' }]],
    },
  };
  bot.sendMessage(chatId, 'Press the button below to send a tweet:', opts);
});

bot.on('message', (msg) => {
  try {
    // You can handle other commands or messages here if needed
    if (msg.text === 'Tweet') {
      tweet(msg.chat.id, 'Hello');
    }
  } catch (e) {
    console.log(e);
  }
});

bot.onText(/\/tweet/, (msg) => {
  const chatId = msg.chat.id;
  const opts = {
    reply_markup: {
      inline_keyboard: [[{ text: 'Tweet', callback_data: 'tweetButton' }]],
    },
  };
  bot.sendMessage(chatId, 'Press the button below to send a tweet:', opts);
});

bot.on('callback_query', (query) => {
  if (query.data === 'tweetButton') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(query.message.chat.id, 'Enter your message text:');
    bot.once('message', (message) => {
      //tweet fuction
      tweet(query.message.chat.id, message.text);
      //send telegram message
      sendTelegramMessage(message.text);

    });
  }
});

const tweet = async (chatId, text) => {
  try {
    const tweet = await rwClient.v2.tweet(text);
    await bot.sendMessage(chatId, 'Tweet sent successfully!');
//     axios.get(`https://api.telegram.org/bot${botToken}/sendMessage`, {
//     chat_id: chatId,
//     text: '/start',
// })
  } catch (e) {
    // bot.sendMessage(chatId, 'Error sending tweet. Please try again.');
    // console.log("tweet error", e?.data?.errors[0]);
    if(e?.data?.errors[0]?.message == "Your Tweet text is too long. For more information on how Twitter determines text length see https://github.com/twitter/twitter-text."){
      // bot.sendMessage(chatId, 'Tweet is too long. Please try again.');
      tweet(chatId, text.replace(/🚀 Explore instant job and internship updates on our Telegram & WhatsApp Groups!\n🔗 Link to Join: https:\/\/linktr.ee\/hyreme/, ''));
    }
    else{
      bot.sendMessage(chatId, 'Error sending tweet. Please try again.');
    }
  }
};
const sendTelegramMessage = async (text) => {
  try {
    bot.sendMessage(channelId, text);
  } catch (e) {
    console.log(e);
  }
};

