const config = require('config');
const FeedParser = require('feedparser');
const request = require('request-promise');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const schedule = require('node-schedule');

function fetch({ url, mattermostUrl, dbFileName, iconUrl, username, channel, author, authorIconUrl, color}) {
    console.log(`Fetch ${url}`);
    const req = request(url);
    const feedparser = new FeedParser();

    const adapter = new FileSync(`./db/${dbFileName}.json`);
    const db = low(adapter);

    // Set some defaults (required if your JSON file is empty)
    db.defaults({ posts: [] }).write()



    req.on('error', console.error);
    req.on('response', function (res) {
        // `this` is `req`, which is a stream
        const stream = this;

        if (res.statusCode !== 200) {
            return this.emit('error', new Error('Bad status code'));
        }

        stream.pipe(feedparser);
    });



    feedparser.on('error', console.error);
    feedparser.on('readable', async function () {
        const stream = this; // `this` is `feedparser`, which is a stream
        let item;

        while (item = stream.read()) {
            const itemInDb = db.get('posts')
                // we identify items by their link as they are articles
                .find({ link: item.link })
                .value();

            // if the post is already in db, we have already send it to mattermost…
            if (itemInDb) {
                return

                //… so if the total shares count did not change, we choose to not resend it
                // console.log('db', itemInDb["buzzsumo:shares"]["buzzsumo:total"]['#']);
                // console.log('item', item["buzzsumo:shares"]["buzzsumo:total"]['#']);
                // if (itemInDb["buzzsumo:shares"]["buzzsumo:total"]['#'] <= item["buzzsumo:shares"]["buzzsumo:total"]['#']) {
                //     return;
                // }
            }

            const sanitizedDescription = item.description.substring(0, item.description.indexOf('<'));

            await request({
                url: mattermostUrl,
                method: 'POST',
                json: {
                    response_type: 'in_channel',
                    username: username,
                    icon_url: iconUrl,
                    channel: channel,
                    attachments: [
                        {
                            "author_name": author || item.author,
                            "author_icon": authorIconUrl, 
                            "author_link": item.link, 
                            "title": item.title,
                            "title_link": item.link,
                            "color": color,
                            "text": 
`
${sanitizedDescription}

**Total engagement: ${item["buzzsumo:shares"]["buzzsumo:total"]['#']}**
Facebook: ${item["buzzsumo:shares"]["buzzsumo:facebook"]['#']}    Twitter: ${item["buzzsumo:shares"]["buzzsumo:twitter"]['#']}    Pinterest: ${item["buzzsumo:shares"]["buzzsumo:pinterest"]['#']}    Reddit: ${item["buzzsumo:shares"]["buzzsumo:reddit"]['#']}

**Publication date:** ${item.pubDate}
`
                        }
                    ]
                },
            }).then((response) => {
                db.get('posts')
                    .push(item)
                    .write();
            });
        }
    });
}

console.log('Start mattermost-incoming-webhook-rss')
var j = schedule.scheduleJob('*/1 * * * *', function () {
    console.log('Fetch feeds');
    const feeds = config.get('feeds');

    Object.keys(feeds).forEach((feed) => {
        fetch(feeds[feed]);
    });
});