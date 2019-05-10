In the context of disinformation, Panoptès fetches content from different detectors and sends formatted messages to Mattermost

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
- `mattermost.actions.urls.mediaScale`: URL of the action to call [media-scale](https://github.com/ambanum/media-scale).
- `mattermost.actions.urls.mediaScaleResponseUrl`: URL of the incoming webhook from [media-scale](https://github.com/ambanum/media-scale).

Then you have to add some sources. There are two kinds of sources supported for now, RSS feeds from Buzzsumo and JSON files from [AlgoTransparency.org](https://algotransparency.org/).

```json
{
	"mattermost": {
		…
	},
	"sources": {
		"rss": {
			"lemonde": {
				"feedUrl": "https://app.buzzsumo.com/rss/alerts/ODJHGFTUxa2p87jhgqsdjfh%3D",
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
- `baseUrl`: URL of the folder containing JSON daily files from AlgoTransparency
- `maxItems`: Max number of videos to display every day

For both:
- `message.author`: Author name to display in the [Mattermost attachment](https://docs.mattermost.com/developer/message-attachments.html)
- `message.authorIconUrl`: Author icon or logo URL to display in the [Mattermost attachment](https://docs.mattermost.com/developer/message-attachments.html)
- `message.color`: Color to display in the [Mattermost attachment](https://docs.mattermost.com/developer/message-attachments.html)


# Usage

```
node index.js
```

- RSS Feeds will be fetched every minute and only new content will be sent to Mattermost.
- AlgoTransparency will be fetched daily and only the top `maxItems` most recommended videos will be sent to Mattermost.
