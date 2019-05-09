In the context of disinformation, Panoptès fetch content from different detectors and sends formatted messages to Mattermost

# Installation

```
npm install
```

# Configuration

First of all you have to configure mattermost integrations'url in the `config/default.json` file:
```json
{
	"mattermost": {
		"incomingWebhookUrl": "http://localhost:8065/hooks/dijcdr5s1tfajy8yorqwii4rny",
		"actions": {
			"urls": {
				"sendToAnalysis": "http://host.docker.internal:3000/sendToAnalysis",
				"mediaScale": "http://host.docker.internal:3000/media-scale"
			}
		}
	},
…
}
```

- `mattermost.incomingWebhookUrl`: URL of the incoming webhook created to receive requests. An incoming webhook must be created on your Mattermost server. [See Mattermost Incoming Webhooks documentation for more information](https://docs.mattermost.com/developer/webhooks-incoming.html).

- `mattermost.actions.urls.sendToAnalysis`: URL of the action to send message to Analysis channel.
- `mattermost.actions.urls.mediaScale`: URL of the action to call media-scale.


Then you have to add some sources. There are two kinds of sources supported for now, RSS feeds from Buzzsumo and [AlgoTransparency.org](https://algotransparency.org/).

```json
{
	"mattermost": {
		…
	},
	"sources": {
		"rss": {
			"rt": {
				"feedUrl": "https://www.lemonde.fr/rss/une.xml",
				"message": {
					"author": "Le monde",
					"authorIconUrl": "https://pbs.twimg.com/profile_images/817042499134980096/LTpqSDMM.jpg",
					"color": "#88BB3E"
				}
			},
		},
		"algoTransparency": {
			"baseUrl": "https://algotransparency.org/data/france/",
			"maxItems": 5,
			"message": {
				"author": "Youtube France",
				"authorIconUrl": "https://cdn4.iconfinder.com/data/icons/social-messaging-ui-color-shapes-2-free/128/social-youtube-circle-512.png",
				"color": "#c4302b"
			}
		}
	}
}
```
For RSS source:
- `feedUrl`: RSS feed URL.

For AlgoTransparency source:
- `baseUrl`: Url of the data from AlgoTransparency
- `maxItems`: Max number of videos to display every day

For both:
- `message.author`: Author name to display in the Mattermost's attachment
- `message.authorIconUrl`: Author icon or logo URL to display in the Mattermost's attachment
- `message.color`: Color to display in the Mattermost's attachment


# Usage

```
node index.js
```

Feeds will be fetched every minute and only new content will be sent to Mattermost.
