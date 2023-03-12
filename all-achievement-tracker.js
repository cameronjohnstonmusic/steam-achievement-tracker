const request = require('request');
const fs = require('fs');
const maxApi = require('max-api');

const steamId = '76561198142407697'; // replace with your Steam ID
const apiKey = '3126611CE224BFFCC077ED7AE9412484'; // replace with your Steam Web API key


const getRecentlyUnlockedAchievement = (steamId, apiKey) => {
    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=377160&key=${apiKey}&steamid=${steamId}&l=en`; // replace APPID with the appropriate game ID

    request.get(url, (err, res, body) => {
        if (err) {
            console.error(err);
            return;
        }
        const data = JSON.parse(body);
        maxApi.post(url);
        const unlockedAchievements = data.playerstats.achievements.filter(a => a.achieved === 1);
        if (unlockedAchievements.length === 0) {
            console.log('No achievements unlocked');
            return;
        }
        const achievement = unlockedAchievements[0];
        console.log(`Most recently unlocked achievement: ${achievement.apiname}`);
        //downloadAchievementIcon(achievement);
    });
};


const downloadAchievementIcon = (url) => {
    const newUrl = url.replace("_english", ""); // remove "_english" from the URL
    request.head(newUrl, (err, res, body) => {
        request(newUrl)
            .pipe(fs.createWriteStream('achievement-icon.jpg'))
            .on('close', () => {
                console.log('Downloaded achievement icon');
            });
    });
};


getRecentlyUnlockedAchievement(steamId, apiKey);
