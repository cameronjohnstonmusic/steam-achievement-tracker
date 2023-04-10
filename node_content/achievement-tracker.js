

const steamAPI = require('steam-webapi');
const request = require('request');
const maxApi = require('max-api');
const fs = require('fs');
const axios = require('axios');



var apiKey;
var steamID;
var gameID;

maxApi.addHandler('bang', (msg) => {
    //maxApi.post(url);

    setInterval(getAchievements, 10000);
});

maxApi.addHandler('apiKey', (msg) => {

    apiKey = msg;
    maxApi.post(apiKey);
});

maxApi.addHandler('steam', (msg) => {

    steamID = msg;
    maxApi.post(steamID);
});

maxApi.addHandler('gameID', (msg) => {

    gameID = msg;
    maxApi.post(gameID);
});

let lastDownloadedAchievement;
let achievementsEarned = 0;
let achievementLast2;





async function getAchievements() {
    url = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=' + gameID + '&key=' + apiKey + '&steamid=' + steamID;

    maxApi.post(url);
    console.log('Script Started');
    achievementsEarned = 0;

    request(url, function (error, response, body) {
        if (error) {
            console.error(error);
            return;
        }

        const data = JSON.parse(body);
        //console.log(data);
        const achievements = data.playerstats.achievements;


        let highestAchievement;

        for (let i = 0; i < achievements.length; i++) {
            const achievement = achievements[i];


            if (achievement.achieved == 1) {
                achievementsEarned++
                //maxApi.post(achievement);

                const achievementTime = achievement.unlocktime;
                if (!highestAchievement || achievementTime > highestAchievement.unlocktime) {
                    highestAchievement = achievement;
                    console.log(highestAchievement)
                }
            }
        }

        maxApi.outlet('achievementsEarned', achievementsEarned);

        if (highestAchievement || (!lastDownloadedAchievement && highestAchievement.apiname !== lastDownloadedAchievement.apiname)) {
            downloadAchievementIcon(gameID, highestAchievement.apiname);
            lastDownloadedAchievement = highestAchievement;
            totalAchievments(apiKey, gameID);
        }

        if (achievementsEarned == 0) {
            maxApi.outlet('achievementsEarned', 0);
            totalAchievments(apiKey, gameID);
        }



    });
};

async function downloadAchievementIcon(gameID, achievementLast) {

    if (achievementLast != achievementLast2) {
        maxApi.post('finding icon');
        try {
            const response = await axios.get(
                `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${gameID}`
            );
            const achievements = response.data.game.availableGameStats.achievements;
            const achievement = response.data.game.availableGameStats.achievements.find(
                (a) => a.name === achievementLast
            );
            const index = achievements.indexOf(achievement);
            //console.log(index);
            if (!achievement) {
                throw new Error(
                    `Achievement ${achievementLast} not found for game ID ${gameID}`
                );
            }
            maxApi.outlet(
                "lastAchievement",
                response.data.game.availableGameStats.achievements[index].displayName
            );
            const iconUrl = achievement.icon;
            const iconHash = iconUrl.substring(
                iconUrl.lastIndexOf("/") + 1,
                iconUrl.lastIndexOf(".")
            );
            const iconCdnUrl = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${gameID}/${iconHash}.jpg`;
            //maxApi.post(iconCdnUrl);
            const writer = fs.createWriteStream("achievement-icon.jpg");
            const response2 = await axios.get(iconCdnUrl, { responseType: "stream" });
            response2.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });
            maxApi.post("Achievement icon downloaded");
        } catch (error) {
            console.error(error);
        }
        achievementLast2 = achievementLast;
    }
}

async function totalAchievments(apiKey, gameID) {
    try {
        const response = await axios.get(
            `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${gameID}`
        );
        const achievementLength = response.data.game.availableGameStats.achievements.length;
        maxApi.outlet("length", achievementLength);
    } catch (error) {
        console.error(error);
    }
}