require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('cookie-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const User = require('./models/user');
const seedDB = require('./seeds');

// REQUIRING ROUTES
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

// export DATABASEURL=mongodb://localhost:27017/yelp_camp
const database = process.env.DATABASEURL || 'mongodb://localhost:27017/yelp_camp';

mongoose
	.connect(database, {
		useCreateIndex: true,
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
	session({
		cookie: {
			secure: true,
			maxAge: 60000
		},
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

const port = process.env.PORT || 3000;
const ip = process.env.IP || '0.0.0.0';

app.listen(port, ip, function() {
	console.log('The YelpCamp Server Has Started');
});
