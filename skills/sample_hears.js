/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/
var wordfilter = require('wordfilter');

module.exports = function(controller) {

    /* Collect some very simple runtime stats for use in the uptime/debug command */
    var stats = {
        triggers: 0,
        convos: 0,
    }

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
    });


    controller.hears(['^uptime', '^debug'], 'direct_message,direct_mention', function(bot, message) {

        bot.createConversation(message, function(err, convo) {
            if (!err) {
                convo.setVar('uptime', formatUptime(process.uptime()));
                convo.setVar('convos', stats.convos);
                convo.setVar('triggers', stats.triggers);

                convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.');
                convo.activate();
            }
        });

    });

    controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', function(bot, message) {
        if (message.match[1]) {

            if (!wordfilter.blacklisted(message.match[1])) {
                bot.reply(message, message.match[1]);
            } else {
                bot.reply(message, '_sigh_');
            }
        } else {
            bot.reply(message, 'I will repeat whatever you say.')
        }
    });

    controller.hears(['thanks'], 'direct_message,direct_mention', function(bot, message) {
        if (message.match[1]) {
            bot.reply(message);
        } else {
            bot.reply(message, 'I will repeat whatever you say.')
        }
    });

    controller.hears('clear data', 'direct_message', function(bot, message) {
        controller.storage.teams.all(function(err, all_team_data) {
            all_team_data.map(function(row) {
                //controller.storage.teams.delete(row.id, function(err) {
                //console.log(err)
                //});
            });
        });
    });

    controller.hears('start counting', 'direct_message,direct_mention,mention', function(bot, message) {
        controller.storage.teams.save({
            id: 'kudos',
            users: {}
        }, function(err) {
            console.log(err)
        });
    });
    controller.hears(['leader','scores','leaderboard','board'], 'direct_message,direct_mention', function(bot, message) {
        controller.storage.teams.get('kudos', function(err, kudos_data) {
          console.log(kudos_data);
            var attachments = [];
  var attachment = {
    title: 'Leaderboard',
    color: '#FFCC99',
    fields: ['Who','Points'],
  };
for(var user in kudos_data.users){
  attachment.fields.push({
    label: 'Field',
    value: user,
    short: true,
  });

  attachment.fields.push({
    label: 'Field',
    value: kudos_data.users[user],
    short: true,
  });
}
  attachments.push(attachment);

  bot.reply(message,{
    text: 'See below...',
    attachments: attachments,
  },function(err,resp) {
    console.log(err,resp);
  });
        });
    });

    controller.hears(['(.*)(\\+\\+)'], 'direct_message,direct_mention', function(bot, message) {
        var who = message.match[1].trim();
        console.log(who + ' scores!');
        //console.log(message);
        //bot.reply(message, who + ' scores!');
        controller.storage.teams.get('kudos', function(err, kudos) {
          
          if(typeof kudos.users[who] !== 'undefined'){
            kudos.users[who]++;
          } else {
            kudos.users[who] = 1;
          }
          controller.storage.teams.save(kudos, function(err, saved) {

                if (err) {
                    bot.reply(message, 'I experienced an error adding point: ' + err);
                } else {
                    bot.api.reactions.add({
                        name: 'thumbsup',
                        channel: message.channel,
                        timestamp: message.ts
                    });
                }

            });
        });
    });


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
    function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = parseInt(uptime) + ' ' + unit;
        return uptime;
    }

};