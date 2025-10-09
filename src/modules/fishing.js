const { GoalNear } = require('mineflayer-pathfinder').goals;

async function startFishing(bot) {
  const fishingRod = bot.inventory.items().find(item => item.name === 'fishing_rod');
  if (!fishingRod) {
    bot.chat("I can't fish without a fishing rod in my inventory.");
    return;
  }

  const waterBlock = bot.findBlock({
    matching: bot.mcData.blocksByName.water.id,
    maxDistance: 64
  });

  if (!waterBlock) {
    bot.chat("I can't find any water nearby.");
    return;
  }

  bot.chat("Found water. Moving to a good fishing spot...");

  await bot.pathfinder.setGoal(new GoalNear(waterBlock.position.x, waterBlock.position.y, waterBlock.position.z, 2));

  try {
    bot.chat("I've arrived. Casting my line now.");
    await bot.equip(fishingRod, 'hand');
    await bot.fish();
    bot.chat("Finished fishing for now.");
  } catch (err) {
    bot.chat(`Something went wrong while trying to fish: ${err.message}`);
  }
}

module.exports = { startFishing };
