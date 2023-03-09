const request = require('request');
const fs = require('fs');

const steamId = 'YOUR_STEAM_ID_HERE'; // replace with your Steam ID
const apiKey = '76561198142407697'; // replace with your Steam Web API key

const getRecentlyUnlockedAchievement = (steamId, apiKey) => {
    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=APPID&key=${apiKey}&steamid=${steamId}&l=en`; // replace APPID with the appropriate game ID
    request.get(url, (err, res, body) => {
        if (err) {
            console.error(err);
            return;
        }
        const data = JSON.parse(body);
        const achievement = data.playerstats.achievements.find(a => a.achieved === 1);
        if (!achievement) {
            console.log('No achievements unlocked');
            return;
        }
        console.log(`Most recently unlocked achievement: ${achievement.apiname}`);
        downloadAchievementIcon(achievement.icon);
    });
};

const downloadAchievementIcon = (url) => {
    request.head(url, (err, res, body) => {
        request(url)
            .pipe(fs.createWriteStream('achievement-icon.jpg'))
            .on('close', () => {
                console.log('Downloaded achievement icon');
            });
    });
};

getRecentlyUnlockedAchievement(steamId, apiKey);
