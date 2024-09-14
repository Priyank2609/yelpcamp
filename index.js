const express = require("express");
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const Campground = require("./model/campground");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require('joi');
const { campSchema } = require("./Schema");
const { revSchema } = require("./Schema")
const Review = require("./model/review")
const port = 3000;


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
}

main()
    .then(res => console.log("database connected"))
    .catch(err => console.log(err));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"public")))
const validateCampground = (req, res, next) => {
    const { error } = campSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    console.log(req.body)
    const { error } = revSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


app.get("/", catchAsync(async (req, res) => {
    const camp = await Campground.find({});
    console.log(camp);
}))

app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}))

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
})

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
}))

app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    const data = req.body.campground;
    const campground = new Campground(data);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const data = req.body.campground;
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, data);
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}))

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const data = req.body.review;
    const campground = await Campground.findById(id);
    const review = new Review(data);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${id}`)
}))

app.all("/*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.msg) {
        err.msg = "Something went wrong!!"
    }
    res.status(status).render("error", { err });
})


app.listen(port, () => {
    console.log(`Serving at port:${port}`);
})
