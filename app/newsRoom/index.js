const config = require('config');
const mattermostConfig = config.get('mattermost');
let request = require('request');
request = request.defaults({
	jar: true
});
const cheerio = require('cheerio');


function fetchNews() {

	var headers = {
		'authority': 'newsroom.crisotech.com',
		'cache-control': 'max-age=0',
		'origin': 'https://newsroom.crisotech.com',
		'upgrade-insecure-requests': '1',
		'content-type': 'application/x-www-form-urlencoded',
		'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
		'sec-fetch-user': '?1',
		'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
		'sec-fetch-site': 'same-origin',
		'sec-fetch-mode': 'navigate',
		'referer': 'https://newsroom.crisotech.com/wp-login.php?loggedout=true&wp_lang=fr_FR',
		'accept-encoding': 'gzip, deflate, br',
		'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
	};

	var dataString = 'log=observateur&pwd=V%40riole19&wp-submit=Se+connecter&redirect_to=https%3A%2F%2Fnewsroom.crisotech.com%2Fwp-admin%2F&testcookie=1';

	var options = {
		url: 'https://newsroom.crisotech.com/wp-login.php',
		method: 'POST',
		headers: headers,
		body: dataString,
		gzip: true,
		followRedirect: true,
		maxRedirects: 20,
	};

	function callback(error, response, body) {
		const data = [];

		request('https://newsroom.crisotech.com', function (error, response, html) {
			// console.log(html);
			const $ = cheerio.load(html);
			$('.gridlove-posts > *').each((i, elem) => {
				data.push({
					title: $(elem).find('.entry-title a').text(),
					link: $(elem).find('.entry-title a').attr('href'),
					content: $(elem).find('.entry-content').text(),
					categories: $(elem).find('.entry-category a').map((i, cat) => $(cat).text().trim()).get(),
				});
			});

      console.log(data);

      const messageContent = 'derp';

			const commonAttachmentOptions = {
				"author_name": "NewsRoom",
				// "author_icon": message.authorIconUrl,
				// "author_link": item.link,
				"title": data[0].title,
				"title_link": data[0].link,
				// "color": message.color,
				"text": messageContent
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
					}
				]
			};

			const json = {
				response_type: 'in_channel',
				attachments: [Object.assign(actionAttachmentOptions, commonAttachmentOptions)],
			};

			// console.log(`Article from ${message.author}: ${item.title}`)

			request({
				url: mattermostConfig.incomingWebhookUrlExercice,
				method: 'POST',
				json,
			}, (response) => {
				// db.get('posts')
				// 	.push(item)
				// 	.write();
			});
		});
	}

	request(options, callback);
}


module.exports = {
	fetchNews
}

fetchNews();
