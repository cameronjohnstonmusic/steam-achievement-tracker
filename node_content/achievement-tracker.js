

const steamAPI = require('steam-webapi');
const request = require('request');
const maxApi = require('max-api');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const SteamCommunity = require('steamcommunity');
const community = new SteamCommunity();
var SteamID = SteamCommunity.SteamID;

const SteamAPI = require('steamapi');




var apiKey;
var steamID;
var gameID;

maxApi.addHandler('bang', (msg) => {
    //maxApi.post(url);
    totalAchievements(apiKey, gameID)

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

var firstTime = 0;

var lastNewAchievement

async function getAchievements() {

    if (firstTime != 1) {
        console.log("running first time");

        const steam = new SteamAPI(apiKey);

        var highestAchievementTime;
        var highestAchievementName;
        var highestAchievementApi;

        try {
            var highestAchievementTime = 0;

            const summary = await steam.getUserAchievements(steamID, gameID);
            //console.log(summary);
            const achievements = summary.achievements;

            for (i = 0; i < achievements.length; i++) {
                var checkingAchievementTime = achievements[i].unlockTime

                if (checkingAchievementTime > highestAchievementTime) {
                    highestAchievementTime = checkingAchievementTime;
                    highestAchievementName = achievements[i].name
                    highestAchievementApi = achievements[i].api
                }
            }

            console.log(highestAchievementName);

            firstTime = 1;
            // Do something with the most recently unlocked achievement
            downloadAchievementIcon2(gameID, highestAchievementApi);
        } catch (err) {
            console.error(err);
        }
    }









    var url = `https://steamcommunity.com/profiles/${steamID}/stats/${gameID}`;
    //maxApi.post(url);
    axios.get(url)

        .then(response => {
            const $ = cheerio.load(response.data);
            const achieveRows = Array.from($('.achieveRow'));

            // Filter out the hidden achievement row and locked achievements
            const filteredAchieveRows = achieveRows.filter(row => $(row).find('.achieveUnlockTime').length > 0);

            if (filteredAchieveRows.length === 0) {
                console.log('No unlocked achievements found');
                maxApi.outlet("achievementsEarned", 0);
                return;
            }

            // Sort the achievements by date unlocked
            filteredAchieveRows.sort((a, b) => {
                const aDate = $(a).find('.achieveUnlockTime').text().trim().replace(/(?:\r\n|\r|\n|\s+)/g, ' ').match(/Unlocked ([a-zA-Z]{3}) (\d{1,2})(,)? (\d{4})? @ (\d{1,2}):(\d{2})(am|pm)/);
                const bDate = $(b).find('.achieveUnlockTime').text().trim().replace(/(?:\r\n|\r|\n|\s+)/g, ' ').match(/Unlocked ([a-zA-Z]{3}) (\d{1,2})(,)? (\d{4})? @ (\d{1,2}):(\d{2})(am|pm)/);

                const months = {
                    Jan: 0,
                    Feb: 1,
                    Mar: 2,
                    Apr: 3,
                    May: 4,
                    Jun: 5,
                    Jul: 6,
                    Aug: 7,
                    Sep: 8,
                    Oct: 9,
                    Nov: 10,
                    Dec: 11
                };

                // Default to the current year if year is not listed
                const aYear = aDate && aDate[4] ? aDate[4] : new Date().getFullYear();
                const bYear = bDate && bDate[4] ? bDate[4] : new Date().getFullYear();

                // Make year optional in regular expression and check for null value after match
                if (!aDate) return -1;
                if (!bDate) return 1;

                const aTime = new Date(
                    aYear,
                    months[aDate[1]],
                    aDate[2],
                    parseInt(aDate[5]) + (aDate[7] === 'pm' && parseInt(aDate[5]) !== 12 ? 12 : 0),
                    aDate[6]
                ).getTime();
                const bTime = new Date(
                    bYear,
                    months[bDate[1]],
                    bDate[2],
                    parseInt(bDate[5]) + (bDate[7] === 'pm' && parseInt(bDate[5]) !== 12 ? 12 : 0),
                    bDate[6]
                ).getTime();

                return bTime - aTime;
            });

            // Get the newest achievement
            //maxApi.post("Rows" + filteredAchieveRows);
            const newestAchievement = filteredAchieveRows[0];

            const firstAchieveName = $(newestAchievement).find('.achieveTxt h3').text().trim();

            // Update the max/msp outlets
            console.log(`Total Achievements Unlocked: ${filteredAchieveRows.length}`);
            maxApi.outlet("achievementsEarned", filteredAchieveRows.length);

            if (firstAchieveName && (firstAchieveName !== lastNewAchievement || $(newestAchievement).find('.achieveUnlockTime').text().trim() !== lastNewAchievement.time)) {
                if ($(newestAchievement).find('.achieveUnlockTime').text().trim() >= highestAchievementTime) {



                    //console.log(firstAchieveName);
                    //maxApi.post(firstAchieveName);
                    maxApi.outlet("lastAchievement", firstAchieveName);
                    lastNewAchievement = firstAchieveName;
                    const imgSrc = $(newestAchievement).find('.achieveImgHolder img').attr('src');
                    downloadAchievementIcon(imgSrc, firstAchieveName);
                }
            } else {
                maxApi.outlet("lastAchievement", lastNewAchievement);
                const imgSrc = $(newestAchievement).find('.achieveImgHolder img').attr('src');
                downloadAchievementIcon(imgSrc, lastNewAchievement);
            }

        })
        .catch(error => {
            console.log(error);
            maxApi.post(error);
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






async function downloadAchievementIcon(imgUrl, achievementLast) {

    if (achievementLast != achievementLast2) {
        maxApi.post('finding icon');
        try {

            const iconCdnUrl = imgUrl;
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

async function downloadAchievementIcon2(gameID, achievementLast) {

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
        console.log("Total Achievements:" + achievementLength);
        maxApi.outlet("length", achievementLength);
    } catch (error) {
        console.error(error);
    }
}



