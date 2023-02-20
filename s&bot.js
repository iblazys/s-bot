// ==UserScript==
// @name         s&bot
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  claim a s&box key with from their dirty ball torture service
// @author       iBlazys
// @homepageURL  https://github.com/iblazys
// @match        https://asset.party/get/developer/preview
// @icon         https://www.google.com/s2/favicons?sz=64&domain=asset.party
// @grant        none
// @supportURL   none
// ==/UserScript==

(function() {
    'use strict';

    // -----------------------------VARIABLES-----------------------------

    // The username we should be targetting
    var Username = "iBlazys"

    // Wait until this value in ms to enter the giveaway
    // 4200000 = 1.16 hours and its a good meme
    // 21600000 = 6 hours
    var WaitUntilMs = 4200000; // maybe set a random time between 100000 and 4200000?

    // Dont mess with the variables below
    var MutateObserver;
    var HasEntered = false;
    var IsInGiveaway = false;
    var IsGiveawayStarted = false;
    var RefreshRequested = false;
    var ReadTime = true;
    var EntryChecks = 0;
    var RemovalChecks = 0;

    // -----------------------------FUNCTIONS-----------------------------

    var EnterGiveaway = function ()
    {
        //
        // This code will only run until we've pressed the button
        //
        if(!HasEntered)
        {
            console.log("[s&bot] Trying to enter giveaway...");

            let submit = document.querySelector("button.button.is-large.is-primary:enabled");

            if(submit != null)
            {
                submit.click();
                HasEntered = true;

                console.log("[s&bot] Entered giveaway!");
            }
            else if(EntryChecks >= 10)
            {
                // Check 10 times for the button to become visible / available

                console.log("[s&bot] Cannot find the submit button... are you logged in?");
                console.log("[s&bot] Stopping bot, check if the site has been updated");

                MutateObserver.disconnect();

                // Not even worth refreshing if we can't find the button.
            }

            EntryChecks++;
        }

        //
        // This code gets ran on every document update once we've pressed the button
        //
        if(HasEntered)
        {
            let userList = GetUserData();

            //
            // Check if we are actually in the giveaway list
            //
            if(userList.includes(Username) && !IsInGiveaway)
            {
                console.log("[s&bot] You are now in the giveaway, waiting for disconnections and site updates.");

                let probability = 1 / userList.length * 100;
                let truncated = String(probability).substr(0, 10);

                console.log("[s&bot] assuming there is nothing sus going on, your odds of winning at the time of entering are: " + truncated + "%");

                IsInGiveaway = true;
            }

            //
            // Check for disconnections & updates
            //
            CheckForDisconnectUpdate();

            //
            // Check if the giveaway has started - dont need this
            //
            let nodes = document.querySelectorAll('span.tag');

            if(nodes.length == 5 /** && timeRemaining == 0 **/)
            {
                console.log("Giveaway started!");

                IsGiveawayStarted = true;
            }

            //
            // Check if we've been booted from the queue
            //
            if(!userList.includes(Username) && IsInGiveaway)
            {
                if(RemovalChecks >= 10)
                {
                    // Only refresh once, avoids spamming this.
                    if(!RefreshRequested)
                    {
                        console.log("[s&bot] Looks like we've been booted from the queue, checked multiple times, refreshing in 10 sec");

                        setInterval(RefreshWindow, 10000);
                        RefreshRequested = true;
                    }
                }

                RemovalChecks++;
            }
        }
    }

    // --------------------------------------------------------------------------

    var CheckForDisconnectUpdate = function ()
    {
        let disconnectElement = document.getElementById('components-reconnect-modal');

        if(disconnectElement.classList.contains('components-reconnect-show'))
        {
            // Only refresh once, avoids spamming this.
            if(!RefreshRequested)
            {
                console.log("[s&bot] Disconnection detected, refreshing in 10 seconds.");

                setInterval(RefreshWindow, 10000);
                RefreshRequested = true;
            }
        }

        if(disconnectElement.classList.contains('components-reconnect-rejected'))
        {
            // I have personally had a site update right as a giveaway started.
            // Could have been coincidence or maybe they are targeting bots?

            // Maybe implement protections against this? More investigation needed

            // Only refresh once, avoids spamming this.
            if(!RefreshRequested)
            {
                console.log("[s&bot] Site update detected, refreshing in 10 seconds.");

                setInterval(RefreshWindow, 10000);
                RefreshRequested = true;
            }
        }
        
    }

    // --------------------------------------------------------------------------

    var RefreshWindow = function ()
    {
        window.location = window.location.href;
    }

    // --------------------------------------------------------------------------

    var milliToTime = function(millis) {
        let hours = Math.floor(millis / 36e5);
        millis %= 36e5;
        let minutes = Math.floor(millis / 6e4);

        return hours + "h " + minutes + "m";
    }

    // --------------------------------------------------------------------------

    var GetMsUntilGiveaway = function ()
    {
        // node 1 = schedule 6h 00m 00s
        let nodes = document.querySelectorAll('span.tag');

        let timeString = nodes[1].textContent;

        // Split the string into an array
        let timeArray = timeString.split(' ');

        // Initialize variables for hours, minutes, and seconds
        let hours, minutes, seconds;

        // Loop through array and assign values to variables
        timeArray.forEach(timeUnit => {
            if (timeUnit.includes('h')) {
                hours = parseInt(timeUnit);
            } else if (timeUnit.includes('m')) {
                minutes = parseInt(timeUnit);
            } else if (timeUnit.includes('s')) {
                seconds = parseInt(timeUnit);
            }
        });

        // Calculate total time in milliseconds
        let totalTime = (hours * 3600000) + (minutes * 60000) + (seconds * 1000);

        // Output total time in milliseconds
        //console.log(`Total time remaining in milliseconds: ${totalTime}`);

        return totalTime;
    }

    // --------------------------------------------------------------------------

    var RunBot = function ()
    {
        //console.log("Bot running");

        let timeUntilGiveaway = 0;

        // Get the time and convert it to a friendly date.
        // Keep observing time until we hit a set threshold

        // Save resources, we don't need to keep spamming this.
        if(ReadTime)
        {

        timeUntilGiveaway = GetMsUntilGiveaway();

        }

        // Wait until the set time.

        if(timeUntilGiveaway <= WaitUntilMs)
        {
            ReadTime = false;

            // Enter the giveaway
            EnterGiveaway();
        }
        else
        {
            console.log("[s&bot] Waiting until countdown is " + milliToTime(WaitUntilMs) + " or less");

            CheckForDisconnectUpdate();
        }
    }

    // --------------------------------------------------------------------------

    var GetUserData = function ()
    {
        let userListImages = document.querySelectorAll(".is-flex > img");//document.querySelectorAll('.is-flex');

        //console.log("User count: " + userListImages.length);

        // Load all names of currently registered users into a list
        var nameList = [];

        for(let i = 0; i < userListImages.length; i++)
        {
            nameList.push(userListImages[i].title);
        }

        return nameList;
    }

    // --------------------------------------------------------------------------

    console.log("[s&bot] s&bot v0.2 starting..... good luck!");

    // Start observer
    MutateObserver = new MutationObserver(RunBot);

    MutateObserver.observe(document.body, {
        childList: true, // capture child add/remove on target element.
        characterData: true, // capture text changes on target element
        subtree: true, // capture childs changes too
        characterDataOldValue: false // keep of prev value
    });

    // Running
    console.log("[s&bot] s&bot v0.2 loaded..... no seriously, you'll need it lol");
})();
