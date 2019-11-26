const config = require('config');
const path = require('path');
const mattermostConfig = config.get('mattermost');
const request = require('request-promise');
const FileSync = require('lowdb/adapters/FileSync');

const low = require('lowdb');

let db;

function init() {
	const dbPath = path.join(__dirname, 'db', `socialRoomTendances.json`);
	const adapter = new FileSync(dbPath);
	db = low(adapter);
	// Set some defaults (required if your JSON file is empty)
	db.defaults({
		hashtags: []
	}).write();
}

init();

function fetch() {
	request('https://observateur:V%40riole19@www.socialroom.crisotech.com/api/modules/twitter/tendances').then(res => {
		let items = JSON.parse(res);

		items.sort(function(a, b) {
			return a.nbTweets - b.nbTweets;
		}).forEach((item) => {
			const itemInDb = db.get('hashtags')
				// Posts are uniquely identified by their link URL
				.find({
					name: item.name
				})
				.value();

			// if the post is already in db, it has already been sent to mattermost, so nothing to do…
			if (!itemInDb || (itemInDb.nbTweets + 10 <= item.nbTweets)) {
				let title = `Nouveau hashtag tendance #${item.name}`;
				let text = `Le hashtag **#${item.name}** devient tendance avec **${item.nbTweets} tweets**`;

				if (itemInDb) {
					title = `Evolution du hashtag #${item.name}`;
					text = `Le hashtag **#${item.name}** évolue avec maintenant **${item.nbTweets} tweets**`;
				}

				request({
					url: mattermostConfig.incomingWebhookUrlExercice,
					method: 'POST',
					json: {
						response_type: 'in_channel',
						attachments: [{
							"author_name": 'Social Room',
							"author_icon": 'https://www.socialroom.crisotech.com/res/images/logos/modules/twitter-logo-small.png',
							"author_link": `https://www.socialroom.crisotech.com/modules/twitter/pages/hashTag/${item.name}/tweets`,
							"title": title,
							"title_link": `https://www.socialroom.crisotech.com/modules/twitter/pages/hashTag/${item.name}/tweets`,
							"color": '#3A9DD6',
							"text": text
						}]
					}
				}).then((response) => {
					if (!itemInDb) {
						db.get('hashtags')
						.push(item)
						.write();
					} else {
						db.get('hashtags')
							.find({ name: item.name })
							.assign(item)
							.write();
					}
				}).catch((e) => {
					console.error(e);
				});
			}
		});
	});
}


module.exports = {
	fetch
}
