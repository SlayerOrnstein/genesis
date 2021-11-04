'use strict';

const Command = require('../../models/Command.js');
const SalesEmbed = require('../../embeds/SalesEmbed.js');
const { createGroupedArray, createPageCollector, captures } = require('../../CommonFunctions');

/**
 * Displays current featured deals
 */
class FeaturedDeal extends Command {
  /**
   * Constructs a callable command
   * @param {Genesis} bot  The bot object
   */
  constructor(bot) {
    super(bot, 'warframe.worldstate.featureddeal', 'featureddeal', 'Displays current featured deals', 'WARFRAME');
    this.regex = new RegExp(`^featured\\s?deals?(?:\\s+on\\s+${captures.platforms})?$`, 'i');
  }

  async run(message, ctx) {
    const platformParam = message.strippedContent.match(this.regex)[1];
    const platform = platformParam || ctx.platform;
    const sales = (await this.ws.get('flashSales', platform, ctx.language)).filter(popularItem => popularItem.isFeatured);
    const salesGroups = createGroupedArray(sales, 10);
    const pages = salesGroups.map(group => new SalesEmbed(this.bot, group, platform));
    const msg = await message.reply({ embeds: [pages[0]] });
    await createPageCollector(msg, pages, message.author);
    return this.constructor.statuses.SUCCESS;
  }
}

module.exports = FeaturedDeal;
