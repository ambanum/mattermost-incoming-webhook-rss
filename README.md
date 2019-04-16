Allows subscribing to rss feeds and allows sending feed's updates to a channel with different handlers

# Installation

```
npm install
```

# Configuration

Create or modify the `default.json` config file `config` folder to add a RSS feed:
```
{
    "feeds": {
        "<feed name>": {
            "handler": "buzzsumo", // for now, only the buzzsumo handler is available
            "url": "<feed url>",
            "mattermostUrl": "<mattermost incoming webhook url>",
            "dbFileName": "<database file name to store feed items>",
            "iconUrl": "<icon url to display in the mattermost's channel>",
            "username": "<username to be display in the mattermost's channel>",
            "channel": "<channel to send feeds' items>",
            "action": {
                "targetChannet": "<if a action is defined, this is the targeted channel>",
                "url": "<url for the action>"
            },
            "author": "<author name to display for the feed's item>",
            "authorIconUrl": "<icon url to display for the feed's item>",
            "color": "<color of the mattermost's attachment>"
        },
    },
}
```

# Usage

```
node index.js
```