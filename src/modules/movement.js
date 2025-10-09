const vec3 = require('vec3');

function initMovementEnhancements(bot) {
  bot.on('physicsTick', () => {
    if (bot.entity.isInWater) {
      bot.setControlState('jump', true);
    }
  });

  console.log('Advanced movement enhancements are active.');

  let lastPosition = null;
  let stuckCounter = 0;
  
  setInterval(() => {
    if (bot.pathfinder.isMoving() && lastPosition) {
      if (bot.entity.position.distanceTo(lastPosition) < 0.1) {
        stuckCounter++;
      } else {
        stuckCounter = 0;
      }

      if (stuckCounter > 2) {
        console.log("Bot appears to be stuck. Attempting to escape.");
        attemptToEscape(bot);
        stuckCounter = 0;
      }
    }
    lastPosition = bot.entity.position.clone();
  }, 2000);
}

async function attemptToEscape(bot) {
  const scaffoldBlocks = ['dirt', 'cobblestone', 'netherrack', 'sand'];
  const blockInInventory = bot.inventory.items().find(item => scaffoldBlocks.includes(item.name));

  if (!blockInInventory) {
    console.log(`Cannot escape: No suitable blocks in inventory.`);
    return;
  }

  try {
    await bot.equip(blockInInventory, 'hand');
    bot.setControlState('jump', true);

    const placeBlockOnApex = () => {
      if (bot.entity.velocity.y < 0.1 && bot.entity.velocity.y > -0.1) {
        bot.removeListener('physicsTick', placeBlockOnApex);
        
        const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
        
        bot.placeBlock(referenceBlock, vec3(0, 1, 0)).catch(err => {
          if (!err.message.includes('did not fire within timeout')) {
            console.log(err)
          }
        });
        
        setTimeout(() => {
            bot.setControlState('jump', false);
            console.log(`Placed a ${blockInInventory.name} to escape.`);
        }, 200);
      }
    };

    bot.on('physicsTick', placeBlockOnApex);

  } catch (err) {
    console.log(`An error occurred while trying to escape: ${err.message}`);
    bot.setControlState('jump', false);
  }
}

module.exports = { initMovementEnhancements };
