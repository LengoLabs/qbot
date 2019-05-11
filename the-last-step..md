---
description: This page shows you how to get ready to setup this template.
---

# The Last Step.

## First, you'll have to create a Discord application.

You can do this at [https://discordapp.com/developers](https://discordapp.com/developers).

Once you've done this, click Bot on the sidebar and then create bot. Some options should appear. On this page, you can give your bot a name and profile picture.

You are going to need to use the bot token for later use, so write it down somewhere or keep this page open for later.

You'll also need a spare ranked Roblox bot account, and you'll have to get that bot's cookie with a program like EditThatCookie or just take it using inspect element &gt; application &gt; cookies &gt; https://roblox.com &gt; .ROBLOSECURITY.

You are now going to have to download the bot from Github. Extract the files from the zipped archive and move them to a folder. Then, open up config.json file and configure it with the format below.

```
{
    "token" : "[INSERT DISCORD BOT TOKEN]",
    "prefix" : "q!",
    "cookie" : "[INSERT ROBLOX BOT COOKIE]",
    "groupId" : [INSERT GROUP ID],
    "maximumRank" : 255
}
```

{% hint style="info" %}
Make sure you do not remove or add the parenthesis. They are only meant to be there sometimes.
{% endhint %}

Once you've done that, just run the bot by typing the following code into command prompt while you have used the cd command to get to your bot folder.

```
$ node index.js
```

And that's it. You can invite your bot to your server now in the Oauth2 section of your bot settings at the Discord developers panel. Want to host your bot 24/7? I recommend using Heroku.

Still confused or need help past this point? Contact Lengo\#0001 on Discord. Happy ranking!

