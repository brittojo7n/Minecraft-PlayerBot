const { GoalNear } = require('mineflayer-pathfinder').goals;

let isFishing = false;

async function toggleFishing(bot) {
  if (isFishing) {
    stopFishing(bot);
  } else {
    await startFishing(bot);
  }
}

async function startFishing(bot) {
  isFishing = true;
  bot.chat('Starting to fish continuously. Type "b!fishing" again to stop.');

  try {
    while (isFishing) {
      await fishOnce(bot);
      if (!isFishing) break;
    }
  } catch (err) {
    bot.chat(`Fishing stopped due to an error: ${err.message}`);
    stopFishing(bot);
  }
}

async function fishOnce(bot) {
  const fishingRod = bot.inventory.items().find(item => item.name === 'fishing_rod');
  if (!fishingRod) {
    throw new Error("I don't have a fishing rod.");
  }

  const waterBlock = bot.findBlock({ matching: bot.mcData.blocksByName.water.id, maxDistance: 64 });
  if (!waterBlock) {
    throw new Error("I can't find any water nearby.");
  }

  const distance = bot.entity.position.distanceTo(waterBlock.position);
  if (distance > 4) {
    bot.chat("Moving to a good fishing spot...");
    await bot.pathfinder.setGoal(new GoalNear(waterBlock.position.x, waterBlock.position.y, waterBlock.position.z, 2));
  }
  
  await bot.equip(fishingRod, 'hand');
  await bot.fish();
  console.log('Caught a fish, re-casting!');
}

function stopFishing(bot) {
  if (isFishing) {
    isFishing = false;
    console.log('Fishing has been stopped.');
    if (bot.fishing) {
      bot.activateItem();
    }
  }
}

module.exports = { toggleFishing, stopFishing };
