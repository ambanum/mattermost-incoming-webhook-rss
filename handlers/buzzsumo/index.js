const request = require('request-promise');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbs = {};

function init(dbFileName) {
    const adapter = new FileSync(`./db/${dbFileName}.json`);
    const db = low(adapter);
    // Set some defaults (required if your JSON file is empty)
    db.defaults({ posts: [] }).write();

    dbs[dbFileName] = db;
}

async function handler(item, { dbFileName, mattermostUrl, iconUrl, username, channel, author, authorIconUrl, color, action }) {    
    const db = dbs[dbFileName];
    const itemInDb = db.get('posts')
        // Posts are uniquely identified by their link URL
        .find({ link: item.link })
        .value();

    // if the post is already in db, it has already been sent to mattermost so nothing to do
    if (itemInDb) {
        return;
    }

    // Remove everything after the first HTML tag
    const sanitizedDescription = item.description.substring(0, item.description.indexOf('<'));
    const shares = item["buzzsumo:shares"];
    const messageContent = `
${sanitizedDescription}

**Total engagement: ${shares["buzzsumo:total"]['#']}**
Facebook: ${shares["buzzsumo:facebook"]['#']}    Twitter: ${shares["buzzsumo:twitter"]['#']}    Pinterest: ${shares["buzzsumo:pinterest"]['#']}    Reddit: ${shares["buzzsumo:reddit"]['#']}

**Publication date:** ${item.pubDate}`;

    const commonAttachmentOptions = {
        "author_name": author || item.author,
        "author_icon": authorIconUrl,
        "author_link": item.link,
        "title": item.title,
        "title_link": item.link,
        "color": color,
        "text": messageContent
    };

    const actionAttachmentOptions = {
        "actions": [
            {
                "name": "Send to [FR] Analysis channel",
                "integration": {
                    "url": action.url,
                    "context": {
                        response_type: 'in_channel',
                        username: username,
                        icon_url: iconUrl,
                        channel: action.targetChannel,
                        attachments: [commonAttachmentOptions],
                    }
                }
            }
        ]
    };

    const json = {
        response_type: 'in_channel',
        username: username,
        icon_url: iconUrl,
        channel: channel,
        attachments: [Object.assign(actionAttachmentOptions, commonAttachmentOptions)],
    };

    await request({
        url: mattermostUrl,
        method: 'POST',
        json,
    }).then((response) => {
        db.get('posts')
            .push(item)
            .write();
    });
}

module.exports = {
    init,
    handler
};