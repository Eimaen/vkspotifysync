// --- BEGIN CONSTANTS --- //

// This is a port to listen.
// WARNING: check your spotify api app redirect url. Port has to match.
var port = 3001;

// Theese are client id and client secret of your spotify api application.
// Get them on https://developer.spotify.com/
var clientId = "";
var clientSecret = ""; 

// Needed to access VK music API, get it here: https://vkhost.github.io/
// WARNING: You have to use only token, which is suitable for audio API.
// I, personally, have tested it on VK Admin, should also work fine with Kate.
var vkAccessToken = "";

// --- END CONSTANTS --- //

var express = require('express');
const request = require('request');
var app = express();
var SpotifyWebApi = require('spotify-web-api-node');
var scopes = ['user-read-playback-state'];
var playingInfo = new Object();
playingInfo.spotify = "not authenticated";
playingInfo.vk = "not authenticated";
var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: `http://localhost:${port}/callback`, // Change this if you want to deploy ;)
});

app.get('/raw', (req, res) => {
    res.send(JSON.stringify(playingInfo));
});

app.get('/', (req, res) => {
    if (playingInfo.spotify == "not authenticated")
        res.redirect('/login');
    else
        res.redirect('/raw');
})

app.get('/login', (req, res) => {
    var url = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(url + "&show_dialog=true");
})

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        var data = await spotifyApi.authorizationCodeGrant(code)
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        setInterval(() => {
            spotifyApi.getMyCurrentPlaybackState({})
                .then(function (data) {
                    if (data.body.is_playing) {
                        playingInfo.spotify = `${data.body.item.artists[0].name} - ${data.body.item.name}`;
                        vkPlay(playingInfo.spotify);
                    }
                    else {
                        playingInfo.spotify = "not playing";
                    }
                }, function (err) {
                    console.log('Something went wrong!');
                });
        }, 10000);
        spotifyApi.getMyCurrentPlaybackState({})
            .then(function (data) {
                if (data.body.is_playing) {
                    playingInfo.spotify = `${data.body.item.artists[0].name} - ${data.body.item.name}`;
                    vkPlay(playingInfo.spotify);
                }
                else {
                    playingInfo.spotify = "not playing";
                }
                res.redirect(`/`);
            }, function (err) {
                console.log('Something went wrong!');
            });
    } catch (err) {

    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

function vkPlay(song) {
    request(`https://api.vk.com/method/audio.search?q=${escape(song)}&count=10&auto_complete=1&access_token=${vkAccessToken}&v=5.100`, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        if (body.error)
        {
            if (body.error.error_code == 14)
            {
                // TODO: Captcha
                var sid = body.error.error_code.captcha_sid;
                var img = body.error.error_code.captcha_img;
                return;
            }
        }
        if (body.response.count > 0)
        {
            playingInfo.vk = body.response.items[0];
            request(`https://api.vk.com/method/audio.setBroadcast?audio=${body.response.items[0].owner_id}_${body.response.items[0].id}&audio_ids=${body.response.items[0].owner_id}_${body.response.items[0].id}&access_token=${vkAccessToken}&v=5.100`, {}, (err2, res2, body2) => {
                if (err2) { return console.log(err2); }
            });
        }
        else
            playingInfo.vk = "not found";
    });
}