const mineflayer = require('mineflayer')
const antiAfk = require('./lib/antiafk');
const cmd = require('mineflayer-cmd').plugin
const fs = require('fs');
const server = require('server');
const { get, post } = server.router;
let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);
var lasttime = -1;
var moving = 0;
var first = false;
var connected = 0;
var actions = ['forward', 'back', 'left', 'right']
var lastaction;
var pi = 3.14159;
var moveinterval = 2; // 2 second movement interval
var maxrandom = 5; // 0-5 seconds added to movement interval (randomly)
var host = data["ip"];
var username = data["name"]
var nightskip = data["auto-night-skip"]
var options = {
  host: host,
  port: data["port"],
  username: username
};
var bot = mineflayer.createBot(options);
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;

}

server([
  get('/', ctx => 'Hello world!')
]);

bindEvents(bot)

function bindEvents(bot) {

  bot.loadPlugin(cmd)

  bot.once('login', () => {
    console.log("Trying to login")
    bot.chat('/login achlys_050721')
    console.log("Logged In")
  });

  bot.on('time', function(time) {


    if (nightskip == "true") {
      if (bot.time.timeOfDay >= 13000) {
        bot.chat('/time set day')
      }
    }
    if (connected < 1) {
      return;
    }
    if (lasttime < 0) {
      lasttime = bot.time.age;
    } else {
      var randomadd = Math.random() * maxrandom * 20;
      var interval = moveinterval * 20 + randomadd;
      if (bot.time.age - lasttime > interval) {
        if (moving == 1) {
          bot.setControlState(lastaction, false);
          moving = 0;
          lasttime = bot.time.age;
        } else {
          var yaw = Math.random() * pi - (0.5 * pi);
          var pitch = Math.random() * pi - (0.5 * pi);
          bot.look(yaw, pitch, false);
          lastaction = actions[Math.floor(Math.random() * actions.length)];
          bot.setControlState(lastaction, true);
          moving = 1;
          lasttime = bot.time.age;
          bot.activateItem();
        }
      }
    }
  });

  bot.on('spawn', function() {
    connected = 1;
    bot.loadPlugin(antiAfk);
    bot.afk.start();
  });

  bot.on('death', function() {
    bot.emit("respawn")
    setTimeout(backondeath, 1200);
  });

  bot.on('kicked', function(reason) {
    console.log("Kicked for ", reason);
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
    // If set less than 30s you will get an invalid credentials error, which we handle above.
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
