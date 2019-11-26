const schedule = require('node-schedule');
const rss = require('./app/rss');
const algoTransparency = require('./app/algoTransparency');
const socialRoom = require('./app/socialRoom');

console.log('Start Panoptès');

// Fetch RSS feeds every minutes
schedule.scheduleJob('*/1 * * * *', function () {
	rss.fetchFeeds();
});

// Fetch Top recommended videos every day at 8am
schedule.scheduleJob('0 8 * * *', function () {
	algoTransparency.fetchVideos();
});

schedule.scheduleJob('*/1 * * * *', function () {
	socialRoom.fetch();
});
