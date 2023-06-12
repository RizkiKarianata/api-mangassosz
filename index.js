const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const directory = require("./routers/directory");
const cors = require("cors");
const helmet = require("helmet");

app.use(cors());
app.use(helmet());
app.use("/api", directory);
app.use(express.static("./resources"));
app.use("/api", (req, res) => {
	res.send({
		status: true,
		message: {
			text: "For more information, you can check the link below",
			url: [
				"https://github.com/RizkiKarianata/api-mangassosz",
				"https://github.com/febryardiansyah/manga-api"
			]
		},
		find_me_on: {
			facebook: [
				"https://www.facebook.com/rizky.slankers.3386/",
				"https://www.facebook.com/febry.ardiansyah.792/"
			],
			instagram: [
				"https://instagram.com/rizkikarianata",
				"https://instagram.com/febry_ardiansyah24"
			],
			github: [
				"https://github.com/RizkiKarianata/api-mangassosz",
				"https://github.com/febryardiansyah/manga-api"
			],
		},
	});
});
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "The route path API was not found.",
	});
});
app.listen(PORT, () => {
	console.log("Listening on port:" + PORT);
});