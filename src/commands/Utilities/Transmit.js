'use strict';

const fetch = require('../../resources/Fetcher');
const Command = require('../../models/Command.js');

class Transmit extends Command {
  constructor(bot) {
    super(bot, 'utilities.transmit', 'transmit', 'Send messages formatted like message transmissions', 'UTIL');
    this.usages = [
      { description: 'Send Solaris-esque transmission to a channel', parameters: ['JSON configuration file'] },
    ];
    this.requiresAuth = true;
    this.allowDM = false;
  }

  async run(message) {
    if (message.attachments.first() && message.member.hasPermission('ADMINISTRATOR')) {
      let firstAttach;
      try {
        firstAttach = message.attachments.first();
      } catch (e) {
        this.logger.error(e);
        return this.constructor.statuses.FAILURE;
      }

      if (firstAttach.name.indexOf('.json') === -1) {
        return this.constructor.statuses.FAILURE;
      }
      let channelConfig;

      try {
        channelConfig = await fetch(firstAttach.url);
      } catch (e) {
        await message.reply('Couldn\'t get file.');
        this.logger.error(e);
        this.bot.client.setTimeout(message.delete, 30000);
        return this.constructor.statuses.FAILURE;
      }

      try {
        const tokens = channelConfig.messages;
        if (channelConfig.target) {
          let target = this.bot.client.channels
            .get(channelConfig.target.channel || message.channel.id);
          if (!(message.guild && message.guild.channels.cache.has(target.id))) {
            await message.reply('Channel Not Accessible');
            this.bot.client.setTimeout(message.delete, 30000);
            return this.constructor.statuses.FAILURE;
          }
          this.logger.debug(`has config: ${channelConfig.target.webhook
            && channelConfig.target.webhook.id
            && channelConfig.target.webhook.token}`);
          if (channelConfig.target.webhook
            && channelConfig.target.webhook.id) {
            const wh = (await target.fetchWebhooks()).get(channelConfig.target.webhook.id);
            this.logger.debug(Object.keys(wh));
            if (wh.guildID === target.guild.id) {
              target = wh;
            }
          } else {
            await message.reply('Webhook required');
            this.bot.client.setTimeout(message.delete, 30000);
            return this.constructor.statuses.FAILURE;
          }

          if (channelConfig.cleanFirst) {
            const chnl = this.bot.client.channels.cache.get(channelConfig.target.channel);
            if (chnl.messages.size > 1) {
              await chnl.bulkDelete(tokens.length + 2);
            }
          }
          await target.send('```/// INCOMING TRANSMISSION ///```', {
            username: (channelConfig.systemUser && channelConfig.systemUser.name) || undefined,
            avatarURL: (channelConfig.systemUser && channelConfig.systemUser.avatar) || undefined,
          });
          let wait = 0;
          const baseWait = 6000;
          for (const token of tokens) {
            wait += baseWait;
            switch (token.type) {
              case 'text':
                setTimeout(async () => {
                  await target.send(`\u200B\n\n${token.content}\n\n\u200B`, {
                    username: (channelConfig.systemUser && channelConfig.transmitUser.name)
                      || message.author.username,
                    avatarURL: (channelConfig.systemUser && channelConfig.transmitUser.avatar)
                      || message.author.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
                  });
                }, wait);
                break;
              case 'img':
                setTimeout(async () => {
                  await target.send({
                    files: [{
                      attachment: token.content,
                      name: token.name,
                      username: (channelConfig.systemUser && channelConfig.transmitUser.name)
                        || message.author.username,
                      avatarURL: (channelConfig.systemUser && channelConfig.transmitUser.avatar)
                        || message.author.displayAvatarURL().replace('.webp', '.png').replace('.webm', '.gif'),
                    }],
                  });
                }, wait);
                break;
              default:
                break;
            }
          }
          wait += 20000;
          setTimeout(async () => {
            await target.send('```/// CLOSING TRANSMISSION ///```', {
              username: (channelConfig.systemUser && channelConfig.systemUser.name) || undefined,
              avatarURL: (channelConfig.systemUser && channelConfig.systemUser.avatar) || undefined,
            });
          }, wait);
        }
      } catch (e) {
        this.logger.error(e.message);
        await message.reply('Bad File');
        this.bot.client.setTimeout(message.delete, 30000);
        return this.constructor.statuses.FAILURE;
      }
      this.bot.client.setTimeout(message.delete, 30000);
      return this.constructor.statuses.SUCCESS;
    }
    return this.constructor.statuses.FAILURE;
  }
}

module.exports = Transmit;
