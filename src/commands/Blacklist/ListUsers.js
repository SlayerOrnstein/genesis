'use strict';

const { MessageEmbed } = require('discord.js');

const Command = require('../../models/Command.js');
const { createGroupedArray, embedDefaults, setupPages } = require('../../CommonFunctions');

class ListUsers extends Command {
  constructor(bot) {
    super(bot, 'core.blacklist.list', 'bl ls', 'List users in the blacklist', 'BLOCK');
    this.regex = new RegExp(`^(?:${this.call}?|bl list)`);
    this.requiresAuth = true;
    this.allowDM = false;
  }

  /**
   * Run the command
   * @param {Message} message Message with a command to handle, reply to,
   *                          or perform an action based on parameters.
   * @param {Object} ctx     Message/command context
   * @returns {string} success status
   */
  async run(message, ctx) {
    const global = /--?g(?:lobal)?/ig.test(message.strippedContent) && ctx.isOwner;

    const title = global ? ctx.i18n`Blacklisted Users (Global Incl.)` : ctx.i18n`Blacklisted Users`;

    if (message.guild) {
      const users = await this.settings.getBlacklisted(message.guild.id, global);
      const groupedUsers = createGroupedArray(users, 10);
      const pages = [];
      if (groupedUsers.length) {
        groupedUsers.forEach((userGroup) => {
          const page = new MessageEmbed(embedDefaults);
          page.setTitle(title);
          page.setDescription(userGroup.map(user => `${user} (${user.id})`).join('\n'));
          pages.push(page);
        });
      } else {
        const noDataPage = new MessageEmbed(embedDefaults);
        noDataPage.setTitle(ctx.i18n`No Blacklisted Users`);
        pages.push(noDataPage);
      }
      await setupPages(pages, { message, settings: this.settings });
      return this.constructor.statuses.SUCCESS;
    }
    await message.reply({ content: ctx.i18n`Must be in a guild.` });
    return this.constructor.statuses.FAILURE;
  }
}

module.exports = ListUsers;
