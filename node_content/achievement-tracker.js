const steamAPI = require('steam-webapi');
const request = require('request');
const maxApi = require('max-api');
const fs = require('fs');
const axios = require('axios');


var apiKey;
var steamID;
var gameID;

maxApi.addHandler('bang', (msg) => {
    maxApi.post(url);
    setInterval(getAchievements, 3000);
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





var url;


var lastAchievementTime = 0;
var lastAchievement;
var achievementsEarned = 0;

let lastDownloadedAchievement = null;

function getAchievements() {
	url = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=' + gameID + '&key=' + apiKey + '&steamid=' + steamID;
    console.log('Script Started');
    maxApi.post(url);
    request(url, (error, response, body) => {
        //maxApi.post(body);


        console.log('Req Started');

        let data;


        if (!error && response.statusCode == 200) {

            //console.log(achievementsEarned)



            data = JSON.parse(body);

            //maxApi.post(data);


            const achievements = data.playerstats.achievements;

            //maxApi.post(achievements);
            let highestAchievement = null;

            for (let i = 0; i < achievements.length; i++) {
                const achievement = achievements[i];

                if (achievement.achieved) {
                    achievementsEarned++;

                    const achievementTime = achievement.unlocktime;
                    if (!highestAchievement || achievementTime > highestAchievement.unlocktime) {
                        highestAchievement = achievement;
                        console.log(highestAchievement)
                    }
                }


            }



            maxApi.outlet('length', achievements.length);
            maxApi.outlet('achievementsEarned', achievementsEarned);

            if (highestAchievement && (!lastDownloadedAchievement || highestAchievement.apiname !== lastDownloadedAchievement.apiname)) {
                downloadAchievementIcon(gameID, highestAchievement.apiname);
                lastDownloadedAchievement = highestAchievement;
            }


        }

        if (achievementsEarned == 0) {

            totalAchievments();


            //console.log(index);
            maxApi.outlet('achievementsEarned', 0);
        }

        achievementsEarned = 0;
    });
};


async function downloadAchievementIcon(gameID, achievementLast) {
    try {
        const response = await axios.get(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${gameID}`);
        const achievements = response.data.game.availableGameStats.achievements;
        const achievement = response.data.game.availableGameStats.achievements.find(a => a.name === achievementLast);
        const index = achievements.indexOf(achievement);
        //console.log(index);
        if (!achievement) {
            throw new Error(`Achievement ${achievementLast} not found for game ID ${gameID}`);
        }
        maxApi.outlet('lastAchievement', response.data.game.availableGameStats.achievements[index].displayName);
        const iconUrl = achievement.icon;
        const iconHash = iconUrl.substring(iconUrl.lastIndexOf('/') + 1, iconUrl.lastIndexOf('.'));
        const iconCdnUrl = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${gameID}/${iconHash}.jpg`;
        //maxApi.post(iconCdnUrl);
        const writer = fs.createWriteStream('achievement-icon.jpg');
        const response2 = await axios.get(iconCdnUrl, { responseType: 'stream' });
        response2.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log('Achievement icon downloaded');
    } catch (error) {
        console.error(error);
    }
}

async function totalAchievments() {

    try {
        const response = await axios.get(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${gameID}`);
        const achievementLength = response.data.game.availableGameStats.achievements.length;
        maxApi.outlet('length', achievementLength);

    } catch (error) {
        console.error(error);
    }
}

