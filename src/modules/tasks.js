const { stopFishing } = require('./fishing');

function stopAllTasks(bot, silent = false) {
  console.log('Stopping all current tasks.');
  
  if (!silent) {
    bot.chat('Stopping everything I was doing.');
  }
  
  bot.pathfinder.stop();
  stopFishing(bot);
  bot.clearControlStates();
}

module.exports = { stopAllTasks };

