const axios = require('axios');
const fs = require('fs');
const maxApi = require('max-api');

const gameID = 377160; // Fallout 4's Steam App ID
const achievementName = 'When Freedom Calls';

async function downloadAchievementIcon(gameID, achievementName) {
    try {
        const response = await axios.get(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=3126611CE224BFFCC077ED7AE9412484&appid=${gameID}`);
        const achievement = response.data.game.availableGameStats.achievements.find(a => a.displayName === achievementName);
        if (!achievement) {
            throw new Error(`Achievement "${achievementName}" not found for game ID ${gameID}`);
        }
        const iconUrl = achievement.icon;
        const iconHash = iconUrl.substring(iconUrl.lastIndexOf('/') + 1, iconUrl.lastIndexOf('.'));
        const iconCdnUrl = `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${gameID}/${iconHash}.jpg`;
        maxApi.post(iconCdnUrl);
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

downloadAchievementIcon(gameID, achievementName);
