const chalk = require('chalk');
const inquirer = require('inquirer');
const figlet = require('figlet');
const fs = require('fs');

var configFile = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var initq = [
    {
        name: 'использование',
        type: 'list',
        message: 'Для чего вы используете этот инструмент?',
        choices: ['Настройте qbot в первый раз.', 'Обновите куки.']
    }
]
var updateq = [
    {
        name: 'печенье',
        type: 'input',
        message: 'Что такое бот-файл Roblox?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'Это поле обязательно к заполнению.';
            }
        }
    }
]
var setupq = [
    {
        name: 'знак',
        type: 'input',
        message: 'Что такое бот-токен Discord?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'Это поле обязательно к заполнению.';
            }
        }
    },
    {
        name: 'приставка',
        type: 'input',
        message: 'What is the Discord bot prefix?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'Это поле обязательно к заполнению.';
            }
        }
    },
    {
        name: 'печенье',
        type: 'input',
        message: 'Что такое бот-файл Roblox?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'Это поле обязательно к заполнению.';
            }
        }
    },
    {
        name: 'идентификаторгруппы',
        type: 'number',
        message: 'Что такое идентификатор группы Roblox?'
    },
    {
        name: 'максимальныйранг',
        type: 'number',
        message: 'Каков максимальный номер ранга Roblox?'
    },
    {
        name: 'идентификаторканалажурнала',
        type: 'input',
        message: 'Что такое идентификатор канала журнала Discord?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'Это поле обязательно к заполнению.';
            }
        }
    },
    {
        name: 'крикIDканала',
        type: 'input',
        message: 'Что такое идентификатор канала Discord shout?',
        validate: function(value){
            if(value.length){
                return true;
            } else {
                return 'Это поле обязательно к заполнению.';
            }
        }
    }
]

inquirer.prompt(initq).then(answers => {
    if(answers.usage === 'Настройте qbot в первый раз.'){
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
            console.log(chalk.green('qbot был успешно настроен.'));
        });
    } else {
        inquirer.prompt(updateq).then(answers => {
            configFile.cookie = answers.cookie;
            fs.writeFile('./config.json', JSON.stringify(configFile), (err) => {
                if (err) console.log(err);
            });
            console.log(chalk.green('Ваша конфигурация qbot была успешно обновлена.'));
        });
    }
});
