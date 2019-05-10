const request = require('request-promise');
const config = require('config');
const moment = require('moment');

function fetchVideos() {
	const { message, maxItems, baseUrl } = config.get('sources.algoTransparency');
	const mattermostConfig = config.get('mattermost');

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
					"author_name": `${message.author} : chaîne « ${video.channel} »`,
					"author_icon": message.authorIconUrl,
					"title": video.title,
					"title_link": `https://www.youtube.com/watch?v=${video.id}`,
					"color": message.color,
					"text": `
Views: **${video.views}**
Recommendations: **${video.nb_recommendations}**	Likes: ${video.likes}	Dislikes: ${video.dislikes}

_Data from AlgoTransparency.org_`
				};

				const actionAttachmentOptions = {
					"actions": [{
						"name": "Send to [FR] Analysis channel",
						"integration": {
							"url": mattermostConfig.actions.urls.sendToAnalysis,
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
					url: mattermostConfig.incomingWebhookUrl,
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
