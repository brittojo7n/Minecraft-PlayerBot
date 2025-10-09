const fishTypes = ['cod', 'salmon', 'tropical_fish', 'pufferfish'];

async function dumpFish(bot) {
  bot.chat('Checking for fish to dump...');
  
  const fishToDump = bot.inventory.items().filter(item => fishTypes.includes(item.name));

  if (fishToDump.length === 0) {
    bot.chat('I don\'t have any fish to dump.');
    return;
  }

  let totalCount = 0;
  for (const item of fishToDump) {
    try {
      await bot.toss(item.type, null, item.count);
      totalCount += item.count;
    } catch (err) {
      console.log(`Could not drop ${item.name}: ${err.message}`);
    }
  }

  if (totalCount > 0) {
    bot.chat(`Dumped ${totalCount} fish.`);
  }
}

module.exports = { dumpFish };
