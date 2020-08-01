const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const NodeGeocoder = require('node-geocoder');

const options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

const geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get('/', function(req, res) {
	// Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds) {
		if (err) {
			console.log(err);
		} else {
			res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' });
		}
	});
});

// NEW -show form to create new campgrounds
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
});

// Campground Like Route
router.post('/:id/like', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err) {
			console.log(err);
			return res.redirect('/campgrounds');
		}

		// check if req.user._id exists in foundCampground.likes
		const foundUserLike = foundCampground.likes.some(function(like) {
			return like.equals(req.user._id);
		});

		if (foundUserLike) {
			// user already liked, removing like
			foundCampground.likes.pull(req.user._id);
		} else {
			// adding the new user like
			foundCampground.likes.push(req.user);
		}

		foundCampground.save(function(err) {
			if (err) {
				console.log(err);
				return res.redirect('/campgrounds');
			}
			return res.redirect('/campgrounds/' + foundCampground._id);
		});
	});
});

//CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, function(req, res) {
	// get data from form and add to campgrounds array
	const name = req.body.name;
	const image = req.body.image;
	const desc = req.body.description;
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	geocoder.geocode(req.body.location, function(err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		const lat = data[0].latitude;
		const lng = data[0].longitude;
		const location = data[0].formattedAddress;
		const newCampground = {
			name: name,
			image: image,
			description: desc,
			author: author,
			location: location,
			lat: lat,
			lng: lng
		};
		// Create a new campground and save to DB
		Campground.create(newCampground, function(err, newlyCreated) {
			if (err) {
				console.log(err);
			} else {
				//redirect back to campgrounds page
				console.log(newlyCreated);
				res.redirect('/campgrounds');
			}
		});
	});
});

// SHOW - shows more info about one campground
router.get('/:id', function(req, res) {
	// find the campground with provided ID
	Campground.findById(req.params.id).populate('comments likes').exec(function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash('error', `Campground not found`);
			res.redirect('back');
		} else {
			console.log(foundCampground);
			// render show template with that campground
			res.render('campgrounds/show', { campground: foundCampground });
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	geocoder.geocode(req.body.location, function(err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		delete req.body.campground.rating;
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground) {
			if (err) {
				req.flash('error', err.message);
				res.redirect('back');
			} else {
				req.flash('success', 'Successfully Updated!');
				res.redirect('/campgrounds/' + campground._id);
			}
		});
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, async (req, res) => {
	try {
		let foundCampground = await Campground.findById(req.params.id);
		await foundCampground.remove();
		res.redirect('/campgrounds');
	} catch (error) {
		console.log(error.message);
		req.flash('success', 'Campground deleted successfully!');
		res.redirect('/campgrounds');
	}
});

module.exports = router;
