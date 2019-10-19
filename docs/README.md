# Setup

Click on a page to view it or scroll down to view the Setup page:

[Hosting](https://qbot.lengo.codes/hosting)

[Common Errors](https://qbot.lengo.codes/commonerrors)

---


# Install node.js if you haven't.
First, you must install node.js at https://nodejs.org/ if you haven't already installed it before. Make sure you have restarted your computer when you are done installing it.

# Download qbot.
Next, you must download the qbot code. To do this, head to https://github.com/yogurtsyum/qbot/releases and download the "Source code (zip)" of the latest release. Then, unzip all of the files into a folder.


# Download the required modules.
To install the modules that qbot depends on, open a command prompt in the qbot folder and type the following command.
```npm install discord.js noblox.js chalk figlet inquirer```

# Launch the installer.
To do this, open a command prompt in the qbot folder and type the following command.
```npm run setup```
You will then be asked a few questions that will help qbot work. Here is a list of them and how to find the answers:

## 1. What are you using this tool to do?
Select "Setup qbot for the first time."
## 2. What is the Discord bot token?
To find this, head to https://discordapp.com/developers and then click New Application at the top right. You might have to log in first. Then, click Bot on the side. At the top right, click Add Bot, and then click Yes, do it. You now have a bot account! The next step you have to do is copy the token. To do this, click Copy under Click to Reveal Token - please note that by sharing this with qbot, you are giving the qbot code full access to the bot account you just created. Never share your token with anyone! It gives them full access to your bot account. 
## 3. What is the Discord bot prefix?
What do you want to be the prefix for your commands? It can be anything.
## 4. What is the Roblox bot cookie?
To find this, you need to create a bot account at https://roblox.com and give it a rank that can manage roles in your group. Then, right click anywhere and click Inspect Element or Inspect. At the top of the code that popped up, you will see some tabs like Elements and Console. For this, you will need to go to Application. If you don't see it, click the >> and then Application. Then, on the left side of the Inspect Element popup, click the arrow by Cookies. Then, select https://web.roblox.com - you will then see some information. Next, copy the value of .ROBLOSECURITY - please note that by sharing this with qbot, you are giving the qbot code full access to the bot account you just created. Next, do not log out of Roblox. Simply close the tab. Once you start qbot, you will be automatically logged out of the bot account. Never share your cookie with anyone! It gives them full access to your bot account.
## 5. What is the Roblox group ID?
To find this, go to your group page and copy the small string of numbers in the link.
## 6. What is the Roblox maximum rank number?
What do you want the maximum rank number that qbot can rank to, to be? It can't be above the Roblox bot's rank number.
## 7. What is the Discord log channel ID?
To do this you will need to first enable Developer Mode if it isn't already by going into User Settings -> Appearance -> Developer Mode (and then turn it on). Next, right click on the channel you'd like qbot to log everyone's actions in and click Copy ID. If you don't want a log channel, type "false".
## 8. What is the Discord shout channel ID?
To do this you will need to first enable Developer Mode if it isn't already by going into User Settings -> Appearance -> Developer Mode (and then turn it on). Next, right click on the channel you'd like qbot to announce group shouts in and click Copy ID. If you don't want to announce group shouts in a channel, type "false".

# Invite your bot.
Inviting the bot is easy. Just head back to the application page on https://discordapp.com/developers and click OAuth2 on the side. Then, if you scroll down you will see Scopes and a ton of check boxes. Check the bot box, and then scroll down to Bot Permissions and select Administrator. Next, you can look at the bottom of scopes and head to the link it shows to invite the bot.

# Launch the bot.
Launching the bot is easy as well, just type the following command into the command prompt:
```npm start```

# Thanks for reading!
While you are at it, please join my Discord and subscribe to my channel! ❤️ 
Discord: https://discord.gg/5T3Ed83
Youtube: https://www.youtube.com/channel/UCscJQWFAvn2Mus-ykslGrFg
If you need any help, there are a ton of helpful people on my Discord that can help you out.
