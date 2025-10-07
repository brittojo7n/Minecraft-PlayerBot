const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');
const vec3 = require('vec3');
const fs = require('fs');
const { initMovementEnhancements } = require('./movement');

let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
let isLoggedIn = false;

var options = {
  host: data.ip,
  port: data.port,
  username: data.name,
  password: data.password,
  auth: 'offline'
};

function createAndBindBot() {
  let bot = mineflayer.createBot(options);

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log('Bot has connected.');
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    initMovementEnhancements(bot);

    if (data.login_required === false) {
      console.log('Login not required. Command system is now active.');
      isLoggedIn = true;
    } else {
      console.log('Login required. Waiting for AuthMe prompts...');
    }
  });

  bot.on('messagestr', (message) => {
    if (!data.login_required || isLoggedIn) return;

    console.log(`[SERVER]: ${message}`);
    const lowerMessage = message.toLowerCase();

    const loginKeywords = ['logged in', 'authenticated', 'welcome'];
    if (loginKeywords.some(keyword => lowerMessage.includes(keyword))) {
        console.log('Authentication successful! Command system is now active.');
        isLoggedIn = true;
    }

    if (lowerMessage.includes('/register')) {
      console.log('Registering with password...');
      bot.chat(`/register ${data.password} ${data.password}`);
    } else if (lowerMessage.includes('/login')) {
      console.log('Logging in with password...');
      bot.chat(`/login ${data.password}`);
    }
  });
  
  bot.on('chat', (username, message) => {
    if (!isLoggedIn || username === bot.username) return;

    const prefix = 'b!';
    if (!message.startsWith(prefix)) return;

    const args = message.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'goto') {
      const [x, z] = args.map(Number);
      if (args.length !== 2 || isNaN(x) || isNaN(z)) {
        bot.chat(`Invalid command. Use: b!goto <x> <z>`);
        return;
      }
      
      console.log(`Received goto command for X:${x} Z:${z}`);
      bot.chat(`Moving to X: ${x}, Z: ${z}`);
      const goal = new GoalNear(x, bot.entity.position.y, z, 1);
      bot.pathfinder.setGoal(goal);
    }
  });

  bot.on('kicked', (reason) => {
    console.log("Kicked for ", reason);
    isLoggedIn = false;
    setTimeout(createAndBindBot, 30000);
  });
  
  bot.on('end', () => {
    console.log("Bot has ended");
    isLoggedIn = false;
    setTimeout(createAndBindBot, 30000);
  });
  
  bot.on('error', (err) => {
    console.log('Error attempting to reconnect: ' + err.message);
  });
}

createAndBindBot();