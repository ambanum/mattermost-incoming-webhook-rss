In the context of disinformation, Panoptès fetch content from different detectors and sends formatted messages to Mattermost

# Installation

```
npm install
```

# Configuration

Create or modify the `default.json` config file in the `config` folder to add a RSS feed, here is an example:
```json
{
    "sources": {
        "rss":{
            "LeMonde": {
                "handler": "buzzsumo",
                "feedUrl": "https://www.lemonde.fr/rss/une.xml",
                "mattermost": {
                    "incomingWebhookUrl": "http://localhost:8065/hooks/dijcdr5s1tfajy8yorqwii4rny",
                    "actions": {
                        "urls": {
                            "sendToAnalysis": "http://host.docker.internal:3000/sendToAnalysis",
                            "mediaScale": "http://host.docker.internal:3000/media-scale",
                            "mediaScaleResponseUrl": "http://localhost:8065/hooks/ff7utwjdwjnxzkonh9ni9f4shh"
                        }
                    },
                    "attachment": {
                        "author": "Le monde",
                        "authorIconUrl": "https://pbs.twimg.com/profile_images/817042499134980096/LTpqSDMM.jpg",
                        "color": "#88BB3E"
                    }
                }
            },
        },
            "mattermost": {
                "incomingWebhookUrl": "http://my-mattermost-server.fr/hooks/dijcdr5s1tfajy8yorqwii4rny",
                "action": {
                    "incomingWebhookUrl": "http://my-mattermost-server.fr/integrations/sendToAnalysis"
                },
                "attachment": {
                }
            }
        },
    },
}
```

- `handler`: Handler's name that will parse and handle the RSS feed.

**_For the moment, only the `buzzsumo` handler is available_**. It will parse RSS feed from Buzzsumo alerts and send messages as attachments in Mattermost. [See Mattermost Message Attachments documentation for more information](https://docs.mattermost.com/developer/message-attachments.html).

- `feedUrl`: RSS feed URL.

- `mattermost.incomingWebhookUrl`: URL of the incoming webhook created to receive requests. An incoming webhook must be created on your Mattermost server. [See Mattermost Incoming Webhooks documentation for more information](https://docs.mattermost.com/developer/webhooks-incoming.html).

- `mattermost.action.incomingWebhookUrl`: URL of the incoming webhook created to receive requests from action button contained in messages.

- `mattermost.attachment.author`: Author name to display in the Mattermost's attachment
- `mattermost.attachment.authorIconUrl`: Author icon or logo URL to display in the Mattermost's attachment
- `mattermost.attachment.color`: Color to display in the Mattermost's attachment

# Usage

```
node index.js
```

Feeds will be fetched every minute and only new content will be sent to Mattermost.
