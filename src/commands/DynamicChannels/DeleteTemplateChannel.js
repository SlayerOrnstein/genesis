'use strict';

const Command = require('../../models/Command.js');

class DeleteTemplateChannel extends Command {
  /**
   * Constructs a callable command
   * @param {Genesis} bot  The bot object
   */
  constructor(bot) {
    super(bot, 'dynamicchannels.delete', 'templates delete', 'Delete Template Channel', 'UTIL');
    this.regex = new RegExp(`^${this.call}\\s?(?:(?:<#)?(\\d+)(?:>)?)?$`, 'i');
    this.requiresAuth = true;
    this.allowDM = false;
    this.usages = [
      {
        description: 'Remove a template channel',
        parameters: ['channel mention'],
      },
    ];
  }

  async run(message, ctx) {
    const templateId = message.strippedContent.match(this.regex)[1];
    if (templateId && this.bot.client.channels.cache.has(templateId.trim())) {
      const template = this.bot.client.channels.cache.get(templateId.trim());
      await this.settings.deleteTemplate(template);
      await message.reply({ content: ctx.i18n`${template} removed as a template.` });
      return this.constructor.statuses.SUCCESS;
    }
    return this.constructor.statuses.FAILURE;
  }
}

module.exports = DeleteTemplateChannel;
