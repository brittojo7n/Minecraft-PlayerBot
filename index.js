const mineflayer = require('mineflayer');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));

const options = {
  host: config.server_ip,
  port: config.server_port || 25565,
  username: config.username,
  auth: 'offline',
  version: '1.20.1'
};

function createBot() {
  console.log(`Connecting to ${options.host} as ${options.username}...`);
  const bot = mineflayer.createBot(options);

  bot.once('spawn', () => {
    console.log('Bot has joined the server!');
    startAntiAFK(bot);
  });

  bot.on('kicked', (reason) => {
    console.error('Bot was kicked from the server. Reason:', reason);
    reconnect();
  });

  bot.on('end', (reason) => {
    console.warn('Bot has been disconnected. Reason:', reason);
    reconnect();
  });

  bot.on('error', (err) => {
    console.error('An error occurred:', err.message);
  });
}

function startAntiAFK(bot) {
    console.log('Starting Anti-AFK module...');
    setInterval(() => {
        bot.swingArm('left');
        bot.setControlState('jump', true);
        bot.setControlState('jump', false);
    }, 15000); 
}

function reconnect() {
  const delay = 30000;
  console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
  setTimeout(createBot, delay);
}

createBot();