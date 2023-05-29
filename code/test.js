const maxApi = require('max-api');


maxApi.addHandler('bang', (msg) => {
    //maxApi.post(url);
    totalAchievements(apiKey, gameID)

    setInterval(getAchievements, 3000);
    //getAchievements();
});

maxApi.addHandler('apiKey', (msg) => {

    apiKey = msg;
    maxApi.post(apiKey);
});


maxApi.addHandler('steam', (msg) => {
	maxApi.post(msg);
const largeNumber = BigInt('76561198142407696')
    steamID = largeNumber + BigInt(msg);
    maxApi.post(steamID.toString());
});

maxApi.addHandler('gameID', (msg) => {

    gameID = msg;
     maxApi.post(gameID);
});