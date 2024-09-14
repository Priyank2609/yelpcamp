const mongoose = require("mongoose");
const Campground = require("../model/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
}

main()
    .then(res => console.log("database connected"))
    .catch(err => console.log(err));

const sampleArr = array => array[Math.floor(Math.random() * array.length)]

const func = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground(
            {
                location: `${cities[rand1000].city},${cities[rand1000].state}`,
                title: `${sampleArr(descriptors)} ${sampleArr(places)}`,
                image: `https://picsum.photos/400?random=${Math.random()}`,
                description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis, consectetur eos numquam harum facere laboriosam facilis hic iusto quisquam. Maxime vitae quis recusandae non excepturi, perferendis aperiam odio. Deleniti, mollitia?`,
                price: `${price}`
            }
        )
        await camp.save();
    }
}

func();