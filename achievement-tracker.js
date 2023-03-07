const steamAPI = require('steam-webapi');
const request = require('request');
const maxApi = require('max-api');
const fs = require('fs');


const apiKey = '3126611CE224BFFCC077ED7AE9412484'
const steamID = '76561198142407697';
const gameID = '377160';
const url = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=' + gameID + '&key=' + apiKey + '&steamid=' + steamID
var lastAchievementTime = 0;
var lastAchievement;
var achievementsEarned = 0;

function getAchievements() {
    console.log('Script Started');
    //maxApi.post(url);
    request(url, (error, response, body) => {
        console.log('Req Started');
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body);


            // console.log(data);




            const achievements = data.playerstats.achievements;


            //console.log(achievements.length)
            maxApi.outlet('length', achievements.length)
            for (let i = 0; i < achievements.length; i++) {
                const achievement = achievements[i];

                if (achievement.achieved) {
                    achievementsEarned++;
                    const achievementTime = achievement.unlocktime
                    if (achievementTime > lastAchievementTime) {
                        lastAchievement = achievement.apiname;
                        lastAchievementTime = achievementTime;
                    }
                }





            }
            maxApi.outlet('achievementsEarned', achievementsEarned)
            maxApi.outlet('lastAchievement', lastAchievement)
            achievementsEarned = 0;


        }

    }

    )
    //maxApi.post(url);
};

maxApi.addHandler("bang", (msg) => {
    setInterval(getAchievements, 1000);
});

