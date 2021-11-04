'use strict';

const Command = require('../../models/Command.js');
const { resolvePool } = require('../../CommonFunctions');

class SetPoolGuild extends Command {
  constructor(bot) {
    super(bot, 'promocode.pool.guild', 'glyphs set guild', 'Set a pool\'s guild', 'CODES');
    this.regex = new RegExp(`^${this.call}\\s?(?:--pool\\s?(.*))?([0-9]{0,20})?`, 'i');
    this.usages = [
      {
        description: 'Set the default guild (server) for a pool',
        parameters: ['--pool <pool id>*', '<guild (server) id>'],
        delimBefore: ' ',
        delimAfter: ' ',
      },
    ];
    this.requiresAuth = true;
    this.allowDM = false;
  }

  async run(message) {
    const guildId = message.strippedContent.match(/[0-9]{15,20}/i)[0] || 0;
    const pool = await resolvePool(message, this.settings);
    if (typeof pool === 'undefined') {
      await message.reply({ content: 'You either manage none or too many pools. Please specify the pool ID.' });
      return this.constructor.statuses.FAILURE;
    }
    if (guildId && this.bot.client.guilds.cache.has(guildId)) {
      await this.settings.setPoolGuild(pool, guildId.trim());
      return this.constructor.statuses.SUCCESS;
    }
    await message.reply({ content: 'Please specify a valid guild.' });
    return this.constructor.statuses.FAILURE;
  }
}

module.exports = SetPoolGuild;
