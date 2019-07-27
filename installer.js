const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');
const fs = require('fs');

var configFile = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var initq = [
    {
        name: 'usage',
        type: 'list',
        message: 'What are you using this tool to do?',
        choices: ['Setup qbot for the first time.', 'Update the cookie.']
    }
]
var updateq = [
    {
        name: 'cookie',
        type: 'input',
        message: 'What is the Roblox bot cookie?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'This field is required.';
            }
        }
    }
]
var setupq = [
    {
        name: 'token',
        type: 'input',
        message: 'What is the Discord bot token?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'This field is required.';
            }
        }
    },
    {
        name: 'prefix',
        type: 'input',
        message: 'What is the Discord bot prefix?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'This field is required.';
            }
        }
    },
    {
        name: 'cookie',
        type: 'input',
        message: 'What is the Roblox bot cookie?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'This field is required.';
            }
        }
    },
    {
        name: 'groupId',
        type: 'number',
        message: 'What is the Roblox group ID?'
    },
    {
        name: 'maximumRank',
        type: 'number',
        message: 'What is the Roblox maximum rank number?'
    },
    {
        name: 'logchannelid',
        type: 'input',
        message: 'What is the Discord log channel ID?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'This field is required.';
            }
        }
    },
    {
        name: 'shoutchannelid',
        type: 'input',
        message: 'What is the Discord shout channel ID?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'This field is required.';
            }
        }
    }
]

inquirer.prompt(initq).then(answers => {
    if(answers.usage === 'Setup qbot for the first time.'){
        inquirer.prompt(setupq).then(answers => {
            configFile.token = answers.token;
            configFile.prefix = answers.prefix;
            configFile.cookie = answers.cookie;
            configFile.groupId = answers.groupId;
            configFile.maximumRank = answers.maximumRank;
            configFile.logchannelid = answers.logchannelid;
            configFile.shoutchannelid = answers.shoutchannelid;
            fs.writeFile('./config.json', JSON.stringify(configFile), (err) => {
                if (err) console.log(err);
            });
            console.log(chalk.green('qbot has been successfully setup.'));
        });
    } else {
        inquirer.prompt(updateq).then(answers => {
            configFile.cookie = answers.cookie;
            fs.writeFile('./config.json', JSON.stringify(configFile), (err) => {
                if (err) console.log(err);
            });
            console.log(chalk.green('Your qbot configuration has been successfully updated.'));
        });
    }
});
