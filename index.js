const config = require('config');
const FeedParser = require('feedparser');
const request = require('request-promise');
const schedule = require('node-schedule');

function fetch(options, handler) {
    console.log(`Fetch ${options.url}`);
    const req = request(options.url);
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
            await handler(item, options);
        }
    });
}

console.log('Start mattermost-incoming-webhook-rss')
var j = schedule.scheduleJob('*/1 * * * *', function () {
    console.log('Fetch feeds');
    const feeds = config.get('feeds');

    Object.keys(feeds).forEach((feedName) => {
        const { init, handler } = require(`./handlers/${feeds[feedName].handler}/index.js`);
        
        init(feeds[feedName].dbFileName);
        fetch(feeds[feedName], handler);
    });
});