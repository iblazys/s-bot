# s&bot
simple bot to help claim a key for s&box from the asset.party torture service
- requires tampermonkey

## features

Detects disconnects / site updates.  
Lets you know the **abysmal** chance you have at winning a key.  
Will wait until a set remaining time to enter the giveaway.  
Will not spam the enter button like some other bots.  

### config / setup

set the target username

    // -----------------------------VARIABLES-----------------------------

    // The username we should be targetting
    var Username = "iBlazys"

and set the time remaining that the bot will wait for

    // Wait until this value in ms to enter the giveaway
    // 4200000 = 1.16 hours and its a good meme
    // 21600000 = 6 hours
    var WaitUntilMs = 4200000;



