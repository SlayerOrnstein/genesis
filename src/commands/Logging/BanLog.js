'use strict';

const Command = require('../../models/Command.js');
const { captures } = require('../../CommonFunctions');

class SetBanLog extends Command {
  constructor(bot) {
    super(bot, 'settings.banLog', 'set ban log', 'Sets the log channel for bans.', 'LOGGING');
    this.usages = [
      { description: 'Set the ban log channel', parameters: ['channel id'] },
    ];
    this.regex = new RegExp(`^${this.call}\\s?${captures.channel}?$`, 'i');
    this.requiresAuth = true;
    this.allowDM = false;
  }

  async run(message) {
    const logChannel = message.strippedContent.match(this.regex)[1];
    if (logChannel && this.bot.client.channels.cache.has(logChannel.trim())) {
      await this.settings.setGuildSetting(message.guild, 'banLog', logChannel);
      this.messageManager.notifySettingsChange(message, true, true);
      return this.constructor.statuses.SUCCESS;
    }
    await this.settings.deleteGuildSetting(message.guild, 'banLog');
    this.messageManager.notifySettingsChange(message, true, true);
    return this.constructor.statuses.SUCCESS;
  }
}

module.exports = SetBanLog;
