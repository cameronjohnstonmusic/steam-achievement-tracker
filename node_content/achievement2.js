const SteamUser = require('steam-user');

const steamClient = new SteamUser();

// Replace with your own Steam Web API key
const steamApiKey = '7EE83CE2C09CD970D7E30D67D3843441-steam-web-api-key';

// Replace with the Steam ID of the user you are interested in
const steamUserId = '76561198025198906';

steamClient.logOn();

steamClient.on('loggedOn', () => {
    console.log('Logged into Steam');

    steamClient.subscribeToUser(steamUserId);
});

steamClient.on('user', (steamid, user) => {
    if (steamid.toString() === steamUserId) {
        console.log('Received user data:', user);
    }
});

steamClient.on('notifications', (count, notifications) => {
    console.log('Received notifications:', notifications);
});

steamClient.on('error', (err) => {
    console.error('Steam error:', err);
});

steamClient.webLogOn((sessionID, cookies) => {
    steamClient.setPersona(SteamUser.EPersonaState.Online);

    steamClient.startNotifications({
        domain: 'https://api.steampowered.com',
        appid: 440, // Replace with the Steam ID of the game you are interested in
        contextid: 2,
        steamid: steamUserId,
        key: steamApiKey,
    });
});
