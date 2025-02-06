import { ChannelType, Events } from 'discord.js';

import Handler from '../models/BaseEventHandler.js';

/**
 * Describes a handler
 */
export default class DeleteChannel extends Handler {
  /**
   * Construct handle
   * @param {Genesis} bot  The bot object
   */
  constructor(bot) {
    super(bot, 'handlers.deleteChannel', Events.ChannelDelete);
  }

  /**
   * delete channel from databse
   * @param {Discord.Channel} channel channel to delete from the database
   */
  async execute(...[channel]) {
    this.logger.debug(`Running ${this.id} for ${this.event}`);

    if (channel.type === ChannelType.GuildVoice) {
      return;
    }
    await this.settings.deleteChannel(channel);
    this.logger.debug(`Channel with id ${channel.id} deleted`);
  }
}
