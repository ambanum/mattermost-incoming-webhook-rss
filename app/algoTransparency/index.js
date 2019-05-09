const request = require('request-promise');
const config = require('config');
const moment = require('moment');

function fetchVideos() {
	const {
		mattermost,
		maxItems,
		baseUrl
	} = config.get('sources.algoTransparency');
	const yesterday = moment().subtract(1, 'days').format('DD-MM-YYYY');
	const url = `${baseUrl}france-${yesterday}.json`;

	request(url)
		.then((result) => {
			const {
				info_channels: videos
			} = JSON.parse(result);
			const topRecommandedVideos = videos.sort((video) => video.nb_recommendations).slice(0, maxItems);

			topRecommandedVideos.forEach(async (video) => {

				const commonAttachmentOptions = {
					"author_name": `${mattermost.attachment.author} : ${video.channel}`,
					"author_icon": mattermost.attachment.authorIconUrl,
					"title": video.title,
					"title_link": `https://www.youtube.com/watch?v=${video.id}`,
					"color": mattermost.attachment.color,
					"text": `
Views: **${video.views}**
Recommendations: **${video.nb_recommendations}**	Likes: ${video.likes}	Dislikes: ${video.dislikes}

_Data from AlgoTransparency.org_`
				};

				const actionAttachmentOptions = {
					"actions": [{
						"name": "Send to [FR] Analysis channel",
						"integration": {
							"url": mattermost.actions.urls.sendToAnalysis,
							"context": {
								response_type: 'in_channel',
								attachments: [commonAttachmentOptions],
							}
						}
					}]
				};

				const json = {
					response_type: 'in_channel',
					attachments: [Object.assign(actionAttachmentOptions, commonAttachmentOptions)],
				};

				console.log(`Video: ${video.nb_recommendations} ${video.title}`);

				await request({
					url: mattermost.incomingWebhookUrl,
					method: 'POST',
					json,
				});
			});
		})
		.catch((error) => {
			console.log(error);
		});
}

module.exports = {
	fetchVideos
}
