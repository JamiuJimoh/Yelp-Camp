const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Campground = require('../models/campground');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { authorize } = require('passport');

// ROOT ROUTE
router.get('/', function(req, res) {
	res.render('landing');
});

// show register form
router.get('/register', function(req, res) {
	res.render('register', { page: 'register' });
});

// handle sign up logic
router.post('/register', function(req, res) {
	const newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
	});
	if (req.body.admincode === 'sec123') {
		newUser.isAdmin = true;
	}

	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function() {
			req.flash('success', 'Successfully Signed Up! Nice to meet you ' + req.body.username);
			res.redirect('/campgrounds');
		});
	});
});

//show login form
router.get('/login', function(req, res) {
	res.render('login', { page: 'login' });
});

// handling login logic
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/campgrounds',
		failureRedirect: 'login'
	}),
	function(req, res) {}
);

// logout route
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds');
});

// USER PROFILES
router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash('error', 'Something went wrong.');
			res.redirect('/');
		}
		Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
			if (err) {
				req.flash('error', 'Something went wrong.');
				res.redirect('/');
			}
			res.render('users/show', { user: foundUser, campgrounds });
		});
	});
});

module.exports = router;
