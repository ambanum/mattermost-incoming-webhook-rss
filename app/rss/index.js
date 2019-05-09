const config = require('config');
const FeedParser = require('feedparser');
const request = require('request-promise');
const {
    init,
    handler
} = require('./handlers/buzzsumo');

function fetch(feedName, feedConfig, mattermostConfig, handler) {
    console.log(`Fetch RSS ${feedConfig.feedUrl}`);
    const req = request(feedConfig.feedUrl);
    const feedparser = new FeedParser();


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
         // `this` is `feedparser`, which is a stream
        const stream = this;
        let item;

        while (item = stream.read()) {
            await handler(feedName, item, feedConfig, mattermostConfig);
        }
    });
}

function fetchFeeds() {
	console.log('Fetch RSS content');
    const mattermostConfig = config.get('mattermost');
    const feedsConfig = config.get('sources.rss');

    Object.keys(feedsConfig).forEach((feedName) => {
        init(feedName);
        fetch(feedName, feedsConfig[feedName], mattermostConfig, handler);
    });
};

module.exports = {
    fetchFeeds
}
