'use strict';

const Command = require('../../models/Command.js');
const BuildEmbed = require('../../embeds/BuildEmbed');

/**
 * Create temporary voice/text channels (can be expanded in the future)
 */
class GetBuild extends Command {
  /**
   * Constructs a callable command
   * @param {Genesis} bot  The bot object
   */
  constructor(bot) {
    super(bot, 'builds.get', 'get build', 'Get a build.', 'UTIL');
    this.regex = new RegExp(`^(?:${this.call}|gb)\\s?(.+)?`, 'i');

    this.usages = [
      { description: 'Display information on an existing build from Genesis', parameters: ['build id'] },
    ];
  }

  async run(message) {
    const buildId = message.strippedContent.match(this.regex)[1];
    if (!buildId || buildId.length < 1) {
      return this.constructor.statuses.FAILURE;
    }
    try {
      const build = await this.settings.getBuild(buildId);
      const embed = new BuildEmbed(this.bot, build);
      await message.reply({ embeds: [embed] });
      return this.constructor.statuses.SUCCESS;
    } catch (e) {
      this.logger.error(e);
    }
    return this.constructor.statuses.FAILURE;
  }
}

module.exports = GetBuild;
