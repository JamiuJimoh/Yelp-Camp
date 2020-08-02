require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const User = require('./models/user');
const seedDB = require('./seeds');

// REQUIRING ROUTES
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

mongoose
	.connect(process.env.DATABASEURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(
		() => {
			console.log('Database Successfully Connected');
		},
		(error) => {
			console.log(error);
		}
	);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
// seed the database
// seedDB();
app.locals.moment = require('moment');
// PASSPORT CONFIGURATION
app.use(
	require('express-session')({
		secret: 'Once again Rusty wins cutest dog!',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(process.env.PORT, '0.0.0.0', function() {
	console.log('The YelpCamp Server Has Started');
});
