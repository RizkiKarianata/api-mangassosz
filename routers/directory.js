const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/url");
const replaceBaseURL = `${baseUrl}komik/`;
const AxiosService = require("../helpers/axiosService");

router.get("/search/:query", async (req, res) => {
	await getSearch(req, res);
});

router.get("/search/:query/:page", async (req, res) => {
	await getSearch(req, res);
});

const getSearch = async (req, res, type) => {
	let query = req.params.query;
	let page = req.params.page;

	const url = page == "undefined" || page == undefined ? `${baseUrl}?s=${query}` : `${baseUrl}page/${page}/?s=${query}`;

	try {
		const response = await AxiosService(url);
		const $ = cheerio.load(response.data);
		const element = $(".postbody");
		let list = [];
		let paginationList = [];
		let title, thumbnail, type, rating, end_point;

		element.find("div.pagination > .page-numbers").each((idx, el) => {
			var numberOfPaginations = parseInt($(el).text());
			if($(el).text() != "« Sebelumnya" && $(el).text() != "Berikutnya »") {
				paginationList.push(numberOfPaginations);
			}
		});

		element.find("div.film-list > div.animepost").each((idx, el) => {
			title = $(el)
			.find("div.animposx > div.bigors > a > div.tt > h4")
			.text()
			.trim();

			thumbnail = $(el)
			.find("div.animposx > a > div.limit > img")
			.attr("src")
			.split("?")[0]
			.split("#")[0];

			type = $(el)
			.find("div.animposx > a > div.limit > span.typeflag")
			.attr("class")
			.replace("typeflag ", "");

			rating = $(el)
			.find("div.animposx > div.bigors > div.adds > div.rating > i")
			.text()
			.trim();

			end_point = $(el)
			.find("a")
			.attr("href")
			.replace(replaceBaseURL, "")
			.replace("/komik/", "")
			.replace("/", "");

			list.push({
				title,
				thumbnail,
				type,
				rating,
				end_point
			});
		});

		res.json({
			status  :   true,
			message :   "success",
			list,
			number  :   paginationList.length > 0  ? paginationList[paginationList.length - 1] : 0
		});
	} catch (error) {
		res.send({
			status  :   false,
			message :   error.message,
			list    :   [],
			number  :   0
		});
	}
};

router.get("/manga", async (req, res) => {
	await getList(req, res, 'manga');
});

router.get("/manga/:page", async (req, res) => {
	await getList(req, res, 'manga');
});

router.get("/manhua", async (req, res) => {
	await getList(req, res, 'manhua');
});

router.get("/manhua/:page", async (req, res) => {
	await getList(req, res, 'manhua');
});

router.get("/manhwa", async (req, res) => {
	await getList(req, res, 'manhwa');
});

router.get("/manhwa/:page", async (req, res) => {
	await getList(req, res, 'manhwa');
});

const getList = async (req, res, types) => {
	let page = req.params.page;

	const url = page == "undefined" || page == undefined ? `${baseUrl}baca-${types}` : `${baseUrl}baca-${types}/page/${page}`;

	try {
		const response = await AxiosService(url);
		const $ = cheerio.load(response.data);
		const element = $(".postbody");
		let list = [];
		let paginationList = [];
		let title, thumbnail, type, chapter, update_on, end_point;

		element.find("div.widget-body > div.content > div.film-list > div.pagination > .page-numbers").each((idx, el) => {
			var numberOfPaginations = parseInt($(el).text());
			if($(el).text() != "« Sebelumnya" && $(el).text() != "Berikutnya »") {
				paginationList.push(numberOfPaginations);
			}
		});

		element.find("div.widget-body > div.content > div.film-list > div.listupd > div.animepost").each((idx, el) => {
			title = $(el)
			.find("div.animposx > div.bigor > a > div.tt > h4")
			.text()
			.trim();

			thumbnail = $(el)
			.find("div.animposx > a > div.limit > img")
			.attr("src")
			.split("?")[0]
			.split("#")[0];

			type = $(el)
			.find("div.animposx > a > div.limit > span.typeflag")
			.attr("class")
			.replace("typeflag ", "");

			chapter = $(el)
			.find("div.animposx > div.bigor > div.adds > div.lsch > a")
			.text()
			.trim()
			.replace(/\s+/g, ' ');

			update_on = $(el)
			.find("div.animposx > div.bigor > div.adds > div.lsch > span")
			.text()
			.trim();

			end_point = $(el)
			.find("a")
			.attr("href")
			.replace(replaceBaseURL, "")
			.replace("/komik/", "")
			.replace("/", "");

			list.push({
				title,
				thumbnail,
				type,
				chapter,
				update_on,
				end_point
			});
		});

		res.json({
			status  :   true,
			message :   "success",
			list,
			number  :   paginationList.length > 0  ? paginationList[paginationList.length - 1] : 0
		});
	} catch (error) {
		res.send({
			status  :   false,
			message :   error.message,
			list    :   [],
			number  :   0
		});
	}
};

router.get("/detail/:slug", async (req, res) => {
	const slug = req.params.slug;

	const url = `${baseUrl}komik/${slug}`;

	try {
		const response = await AxiosService(url);
		const $ = cheerio.load(response.data);
		const element = $(".postbody");
		const data = {};
		let genre_list = [];
		let chapter_list = [];
		let spoiler_list = [];

		data.title = $("h1.entry-title")
		.text()
		.trim()
		.replace("Komik", "")
		.replace("\n", "")
		.replace(/\s+/g, ' ')
		.replace(" ", "");

		data.short_description = element
		.find("section.whites > div.infoanime > div.shortcsc")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');

		data.first_chapter = element
		.find("section.whites > div.infoanime > div.epsbaru > div.epsbr:nth-child(1) > a > div.epsbr-box > div.epsbr-left > span.barunew")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');

		data.first_chapter_end_point = element
		.find("section.whites > div.infoanime > div.epsbaru > div.epsbr:nth-child(1) > a")
		.attr("href")
		.replace(baseUrl, "")
		.replace("/komik/", "")
		.replace("/", "");

		data.last_chapter = element
		.find("section.whites > div.infoanime > div.epsbaru > div.epsbr:nth-child(2) > a > div.epsbr-box > div.epsbr-left > span.barunew")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');

		data.last_chapter_end_point = element
		.find("section.whites > div.infoanime > div.epsbaru > div.epsbr:nth-child(2) > a")
		.attr("href")
		.replace(baseUrl, "")
		.replace("/komik/", "")
		.replace("/", "");

		data.thumbnail = element
		.find("section.whites > div.infoanime > div.thumb > img")
		.attr("src")
		.split("?")[0]
		.split("#")[0];

		data.rating = element
		.find("section.whites > div.infoanime > div.thumb > div.rt > div.ratingmanga > div.rtg > div.archiveanime-rating > i")
		.text()
		.trim();

		var all_alternative_title = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(1)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.alternative_title = all_alternative_title.substring(all_alternative_title.indexOf(":") + 1).trim();

		var all_status = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(2)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.status = all_status.substring(all_status.indexOf(":") + 1).trim();

		var all_author = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(3)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.author = all_author.substring(all_author.indexOf(":") + 1).trim();

		var all_illustrator = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(4)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.illustrator = all_illustrator.substring(all_illustrator.indexOf(":") + 1).trim();

		var all_graphics = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(5)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.graphics = all_graphics.substring(all_graphics.indexOf(":") + 1).trim();

		var all_theme = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(6)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.theme = all_theme.substring(all_theme.indexOf(":") + 1).trim();

		var all_type = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(7)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.type = all_type.substring(all_type.indexOf(":") + 1).trim();

		var all_official = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(8)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.official = all_official.substring(all_official.indexOf(":") + 1).trim();

		var all_information = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(9)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.information = all_information.substring(all_information.indexOf(":") + 1).trim();

		var all_readership = element
		.find("section.whites > div.infoanime > div.infox > div.spe > span:nth-child(10)")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');
		data.readership = all_readership.substring(all_readership.indexOf(":") + 1).trim();

		element.find("section.whites > div.infoanime > div.infox > div.genre-info  > a").each((idx, el) => {
			genre_list.push(
				$(el)
				.text()
				.trim()
				.replace("\n", "")
				.replace(/\s+/g, ' ')
			);
		});
		data.genre_list = genre_list || [];

		data.short_description_2 = element
		.find("section.whites > div.infoanime > div.infox > div.shortcsc > p")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');

		data.synopsis = element
		.find("section.tabsarea > #sinopsis > section.whites > div.desc > div.entry-content-single > p")
		.text()
		.trim()
		.replace("\n", "")
		.replace(/\s+/g, ' ');

		element.find("section.tabsarea > #spoiler > div.spoiler-img").each((idx, el) => {
			spoiler_list.push(
				$(el)
				.find("img")
				.attr("src")
				.split("?")[0]
				.split("#")[0]
			);
		});
		data.spoiler = spoiler_list || [];

		element.find("section.whites > div.eps_lst > div.listeps > div.bxcl > ul > li").each((idx, el) => {
			let chapter_title = "Chapter " + $(el)
			.find("span.lchx > a > chapter")
			.text()
			.trim()
			.replace("\n", "")
			.replace(/\s+/g, ' ');

			let chapter_endpoint = $(el)
			.find("span.lchx > a")
			.attr("href")
			.replace(baseUrl, "")
			.replace("/komik/", "")
			.replace("/", "");

			let chapter_posted = $(el)
			.find("span.dt > a")
			.text()
			.trim()
			.replace("\n", "")
			.replace(/\s+/g, ' ');

			if (chapter_endpoint !== undefined) {
				chapter_list.push({
					chapter_title,
					chapter_endpoint,
					chapter_posted
				});
			}
		});
		data.chapter_list = chapter_list || [];

		res.json({
			status  :   true,
			message :   "success",
			data
		});
	} catch (error) {
		res.send({
			status  :   false,
			message :   error.message,
			data    :   {}
		});
	}
});

router.get("/chapter/:slug", async (req, res) => {
	const slug = req.params.slug;

	const url = `${baseUrl}${slug}`;

	try {
		const response = await AxiosService(url);
		const $ = cheerio.load(response.data);
		const element = $(".postbody");
		const data = {};
		let images_list = [];

		const getImages = $('#chimg-auh > img')
		data.images_count = getImages.length;

		$("#chimg-auh > img").each((idx, el) => {
			images_list.push(
				$(el)
				.attr("src")
				.split("?")[0]
				.split("#")[0]
			);
		});

		data.images_list = images_list || [];

		res.json({
			status  :   true,
			message :   "success",
			data
		});
	} catch (error) {
		res.send({
			status  :   false,
			message :   error.message,
			data    :   {}
		});
	}
});

module.exports = router;