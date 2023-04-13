const cheerio = require('cheerio');
const axios = require('axios');
const maxApi = require('max-api');

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

var url = `https://steamcommunity.com/profiles/${steamID}`;

axios.get(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);

        // Find the first <a> element with an 'href' that contains '22380' and get its parent <div> element with class 'game_info_achievement'
        const a = $('a[href*="22380"]:first-child');
        const div = a.parent('div.game_info_achievement');
        const tooltipText = div.attr('data-tooltip-text');
        console.log(tooltipText);
    })
    .catch(error => {
        console.log(error);
    });
