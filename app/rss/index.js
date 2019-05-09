const config = require('config');
const FeedParser = require('feedparser');
const request = require('request-promise');

function fetch(feedName, options, handler) {
    console.log(`Fetch ${options.feedUrl}`);
    const req = request(options.feedUrl);
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
            await handler(feedName, item, options);
        }
    });
}

function fetchFeeds() {
	console.log('Fetch RSS content');
    const feedsConfig = config.get('sources.rss');

    Object.keys(feedsConfig).forEach((feedName) => {
        const { init, handler } = require(`./handlers/${feedsConfig[feedName].handler}/index.js`);

        init(feedName);
        fetch(feedName, feedsConfig[feedName], handler);
    });
};

module.exports = {
    fetchFeeds
}
