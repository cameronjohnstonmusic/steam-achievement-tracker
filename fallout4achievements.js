const steam = require('steam-webapi');

const API_KEY = '3126611CE224BFFCC077ED7AE9412484';
const APP_ID = 377160; // Fallout 4 app ID
const LANGUAGE = 'en'; // language of the achievement names

steam.key = API_KEY;

steam.getSchemaForGame(APP_ID, LANGUAGE, (err, data) => {
    if (err) {
        console.error(err);
    } else {
        const achievements = data.game.availableGameStats.achievements;

        for (const ach of achievements) {
            console.log(`${ach.name}: ${ach.displayName}`);
        }
    }
});
