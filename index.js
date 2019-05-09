const schedule = require('node-schedule');
const rss = require('./app/rss');

console.log('Start Panoptès');

// Fetch RSS feeds every minutes
schedule.scheduleJob('*/1 * * * *', function () {
	rss.fetchFeeds();
});
