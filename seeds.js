const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

const seeds = [
	{
		name: "Cloud's Rest",
		image:
			'https://images.pexels.com/photos/6757/feet-morning-adventure-camping.jpg?auto=compress&cs=tinysrgb&h=350',
		description:
			'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ratione corporis quis molestiae veniam et? Voluptas, ratione perspiciatis reiciendis iste minus deleniti vel, quam velit illum libero minima sequi maiores adipisci aspernatur nostrum suscipit corrupti beatae eius rerum praesentium. Labore voluptates, suscipit est ut excepturi officiis id cupiditate quibusdam delectus ratione!'
	},
	{
		name: 'Dessert Mesa',
		image: 'https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg?auto=compress&cs=tinysrgb&h=350',
		description:
			'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ratione corporis quis molestiae veniam et? Voluptas, ratione perspiciatis reiciendis iste minus deleniti vel, quam velit illum libero minima sequi maiores adipisci aspernatur nostrum suscipit corrupti beatae eius rerum praesentium. Labore voluptates, suscipit est ut excepturi officiis id cupiditate quibusdam delectus ratione!'
	},
	{
		name: 'Canyon Floor',
		image: 'https://images.pexels.com/photos/266436/pexels-photo-266436.jpeg?auto=compress&cs=tinysrgb&h=350',
		description:
			'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ratione corporis quis molestiae veniam et? Voluptas, ratione perspiciatis reiciendis iste minus deleniti vel, quam velit illum libero minima sequi maiores adipisci aspernatur nostrum suscipit corrupti beatae eius rerum praesentium. Labore voluptates, suscipit est ut excepturi officiis id cupiditate quibusdam delectus ratione!'
	}
];

async function seedDB() {
	try {
		await Comment.deleteMany({});
		console.log('Campgrounds removed');
		await Campground.deleteMany({});
		console.log('Comments removed');
		for (let seed of seeds) {
			let campground = await Campground.create(seed);
			console.log('Campground created');
			let comment = await Comment.create({
				text: 'This place is great but I wish there was internet',
				author: 'Homer'
			});
			console.log('Comment created');
			campground.comments.push(comment);
			campground.save();
			console.log('Comments added to campground');
		}
	} catch (err) {
		console.log(err);
	}
}
module.exports = seedDB;
