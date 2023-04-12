

const steamAPI = require('steam-webapi');
const request = require('request');
const maxApi = require('max-api');
const fs = require('fs');
const axios = require('axios');

const SteamCommunity = require('steamcommunity');
const community = new SteamCommunity();
var SteamID = SteamCommunity.SteamID;

const SteamAPI = require('steamapi');




var apiKey;
var steamID;
var gameID;

maxApi.addHandler('bang', (msg) => {
    //maxApi.post(url);

    setInterval(getAchievements, 3000);
    //getAchievements();
});

maxApi.addHandler('apiKey', (msg) => {

    apiKey = msg;
    //maxApi.post(apiKeyMax);
});

maxApi.addHandler('steam', (msg) => {

    steamID = msg;
    //maxApi.post(steamIDMax);
});

maxApi.addHandler('gameID', (msg) => {

    gameID = msg;
    // maxApi.post(gameIDMax);
});

let lastDownloadedAchievement;
let achievementsEarned = 0;
let achievementLast2;
//let lastAchievementTime;





async function getAchievements() {
    const steam = new SteamAPI(apiKey);




    const test = steam.get(`/ISteamUserStats/GetPlayerAchievements/v1/?appid=${gameID}&key=${apiKey}&steamid=${steamID}`).then(summary => {
        //console.log(summary.playerstats.achievements);
        //console.log(test.achievements.apiname);
        const unlockedAchievements = summary.playerstats.achievements.filter(a => a.achieved === 1);
        const sortedAchievements = unlockedAchievements.sort((a, b) => b.unlocktime - a.unlocktime);
        const mostRecentAchievement = sortedAchievements[0];
        console.log(mostRecentAchievement);
        downloadAchievementIcon(gameID, mostRecentAchievement.apiname);
        console.log(`Most recent achievement: (${mostRecentAchievement.apiname})`);

        maxApi.outlet('achievementsEarned', unlockedAchievements.length);
        totalAchievements(apiKey, gameID);

        console.log(`Total achievements unlocked: ${unlockedAchievements.length}`);



    });
}

// async function getMostRecentAchievement() {
//     const steam = new SteamAPI(apiKey);
//     try {


//         // Get the recently played games for the user
//         const recentGames = await steam.getUserRecentGames(steamID);

//         // Find the game you're interested in by appid, or use the first one
//         const game = recentGames[0];
//         //console.log(game);

//         // Get the schema for the game
//         const gameSchema = await steam.getGameSchema(game.appID);

//         // Get the achievements for the game
//         const achievements = gameSchema.availableGameStats.achievements;
//         console.log(achievements);

//         // Find the unlocked achievements for the user
//         const unlockedAchievements = achievements.filter(a => a.achieved === 1);

//         // Sort the unlocked achievements by unlocktime
//         const sortedAchievements = unlockedAchievements.sort((a, b) => b.unlocktime - a.unlocktime);

//         // Get the most recent unlocked achievement
//         const mostRecentAchievement = sortedAchievements[0];
//         console.log(mostRecentAchievement);

//         // Do something with the most recently unlocked achievement
//         // downloadAchievementIcon(game.appid, mostRecentAchievement.name);
//     } catch (err) {
//         console.error(err);
//     }
// }






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

async function totalAchievements(apiKey, gameID) {
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



