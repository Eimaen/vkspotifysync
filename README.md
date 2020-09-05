# vkspotifysync
Sync music broadcasts from Spotify to VK

## Usage
1. Get VK access token using [this page](https://vkhost.github.io/) (click VK Admin, login, allow and copy `accessToken` from the address field).
2. Create a new application on [Spotify Developer](https://developer.spotify.com/) and get a new `clientId` and `clientSecret`.
3. Fill theese values into variables in the beginning of `index.js`. Choose a port for your app.
4. Decide where to deploy an application. After that, setup your callback URL in your Spotify app settings. Then change it in `index.js` (line 30).
5. Enter URL of your app in your browser and pass Spotify auth.

That's it.

## TODO
- Captcha check
- Heroku deploy instructions