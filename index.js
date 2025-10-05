const mineflayer = require('mineflayer')
const fs = require('fs');

// Note: We removed the 'server' and './lib/antiafk' require statements as they are not needed.

let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
let isLoggedIn = false;

var host = data["ip"];
var username = data["name"]
var password = data["password"] // Reads the password from config
var nightskip = data["auto-night-skip"]

var options = {
  host: host,
  port: data["port"],
  username: username,
  auth: 'offline' // Required for cracked servers
};

var bot = mineflayer.createBot(options);

function bindEvents(bot) {

  bot.once('spawn', () => {
    console.log("Bot has connected. Waiting for AuthMe prompts...");
  });

  bot.on('messagestr', (message) => {
    if (isLoggedIn) return; // Don't process messages if already logged in

    console.log(`[SERVER]: ${message}`);
    const lowerMessage = message.toLowerCase();

    // AuthMe Reloaded Logic
    if (lowerMessage.includes('/register')) {
      console.log('Registering with password...');
      bot.chat(`/register ${password} ${password}`);
    } else if (lowerMessage.includes('/login')) {
      console.log('Logging in with password...');
      bot.chat(`/login ${password}`);
    }

    // Check for successful login message
    if (lowerMessage.includes('logged in') || lowerMessage.includes('authenticated')) {
      console.log('Authentication successful! Starting AFK routine.');
      isLoggedIn = true;
      // You can add your anti-AFK logic here if needed, for example:
      // setInterval(() => bot.swingArm(), 5000);
    }
  });


  bot.on('time', function(time) {
    if (nightskip == "true") {
      if (bot.time.timeOfDay >= 13000) {
        bot.chat('/time set day')
      }
    }
  });

  bot.on('death', function() {
    bot.emit("respawn")
    setTimeout(backondeath, 1200);
  });

  bot.on('kicked', function(reason) {
    console.log("Kicked for ", reason);
    isLoggedIn = false;
    setTimeout(relog, 30000);
  });

  bot.on('error', function(err) {
    console.log('Error attempting to reconnect: ' + err.errno + '.');
    if (err.code == undefined) {
      console.log('Invalid credentials OR bot needs to wait because it relogged too quickly.');
      console.log('Will retry to connect in 30 seconds. ');
      setTimeout(relog, 30000);
    }
  });

  bot.on('end', function() {
    console.log("Bot has ended");
    isLoggedIn = false;
    setTimeout(relog, 30000);
  });
}

function backondeath() {
  bot.chat('/back')
}

function relog() {
  console.log("Attempting to reconnect...");
  bot = mineflayer.createBot(options);
  bindEvents(bot);
}

bindEvents(bot)