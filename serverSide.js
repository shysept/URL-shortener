const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const app = express();

mongoose.connect("mongodb://localhost/urlShortener", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

app.locals.duplicateError = "";
app.post("/shortUrls", async (req, res) => {
  if (await ShortUrl.findOne({ full: req.body.fullUrl })) {
    console.log("Already exists!");
    app.locals.duplicateError = "This record already exists!";
  } else {
    app.locals.duplicateError = "";
    await ShortUrl.create({ full: req.body.fullUrl });
  }
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  app.locals.duplicateError = "";
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.get("/delete/shortUrl/:_id", async (req, res) => {
  app.locals.duplicateError = "";
  const { _id } = req.params;
  ShortUrl.deleteOne({ _id })
    .then(() => {
      console.log("Deleted successfully");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

app.delete("/Delete_Data", async (request, res) => {
  ShortUrl.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.listen(process.env.PORT || 5000);
