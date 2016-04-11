import knex from 'knex';
import pg from 'pg';
import util from './util';

let db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        database: 'stuffy_db',
        port: 5432,
        user: 'postgres',
        password: process.env.DB_PASSWORD
    }
});

function generateBidsForAllProducts(products, users) {
    let promises = [];
    products.map(p => {
        promises.push(generateBids(users, p));
    });

    return new Promise((resolve, reject) => {
        Promise.all(promises).then(() => {
            resolve();
        });
    });
}

function generateBids(users, product) {
    let numBids = 0;
    let numBidders = 0;
    const buyout = product.buyout ? product.buyout : 0;
    const startingBid = product.starting_bid;
    const deadline = product.bid_deadline;

    let maxBid = startingBid;
    let lastBidder;
    
    // weirdo implementation for an exponentially decaying distribution
    const rand = Math.random();
    if (rand < 0.3) { // 0.3
        numBids = util.randomInt(0, 3);
        numBidders = util.randomInt(2, 4);
    } else if (rand < 0.7) { // 0.4
        numBids = util.randomInt(3, 9);
        numBidders = util.randomInt(3, 6);
    } else if (rand < 0.9) { // 0.2
        numBids = util.randomInt(9, 15);
        numBidders = util.randomInt(5, 7);
    } else if (rand < 0.98) { // 0.08
        numBids = util.randomInt(15, 25);
        numBidders = util.randomInt(7, 15);
    } else { // 0.03 (super popular item!)
        numBids = util.randomInt(25, 100);
        numBidders = util.randomInt(15, 30);
    }

    // choose n random users; n = numBidders
    let bidders = [];
    const clone = users.slice();
    while (bidders.length < numBidders) {
        const index = util.randomInt(0, clone.length);
        const u = clone.splice(index, 1)[0];
        bidders.push(u);
    }

    let deadlineDifference = 1210000*1000; // 2 weeks
    let lowerBound = deadline.getTime() - deadlineDifference;
    const upperBound = (new Date()).getTime();

    let rows = [];
    for (var i=0; i<numBids; i++) {
        const increment = util.randomInt(1, 5);
        if (buyout !== 0 && (maxBid + increment) >= buyout) {
            break;
        }
        maxBid += increment;

        let index = util.randomInt(0, bidders.length);
        let bidder = bidders[index];
        if (lastBidder && bidder.email == lastBidder.email) {
            index = index > 0 ? index-1 : index+1;
        }
        bidder = bidders[index];

        const bidTime = util.randomInt(lowerBound, upperBound);
        lowerBound = bidTime;
        const row = {
            owner: product.owner,
            item_name: product.item_name,
            bid: maxBid,
            bidder: bidder.email,
            created: util.formatDatetime(new Date(lowerBound))
        };

        rows.push(row);
        
        lastBidder = bidder;
    }

    return new Promise((resolve, reject) => {
        db.batchInsert('bid', rows)
        .then(() => resolve());
    });
}

function insertAdverts(products, users) {
    let rows = [];
    products.map(product => {
        const user = util.randomChoice(users);
        const email = user.username + '@gmail.com';
        const price = Math.floor(product.price) > 0 ? Math.floor(product.price) : null;
        const buyout = util.randomInt(0, 2) == 0 ? price : null;
        const startingBid = buyout != null ? Math.floor(buyout/10) : util.randomInt(0, 20);
        const bidDeadline = util.randomDate();
        const offset = util.randomInt(604800, 5184000) * 1000;
        const returnDate = util.addTimeToDate(bidDeadline, offset);

        const row = {
            owner: email,
            item_name: product.title.slice(0, 128),
            type: product.type,
            description: product.description.slice(0, 1024),
            starting_bid: startingBid,
            bid_deadline: bidDeadline,
            buyout: buyout,
            available_quantity: 1,
            pickup_location: user.location_address.slice(0, 512),
            return_location: user.location_address.slice(0, 512),
            return_date: returnDate
        };
        rows.push(row);
    });

    return new Promise((resolve, reject) => {
        db.batchInsert('advertise_item', rows)
        .then(() => resolve());
    });
}

function insertUsers(users) {
    let rows = []
    users.map(user => {
        const email = user.username + '@gmail.com';
        const phone = util.randomPhoneNumber();
        const gender = util.randomChoice(['M', 'F']);
        const row = {
            email: email,
            username: user.username,
            password: '123',
            first_name: user.first_name,
            last_name: user.last_name,
            gender: gender,
            description: '',
            contact_number: phone,
            address: user.location_address
        };
        rows.push(row);
    });

    return new Promise((resolve, reject) => {
        db.batchInsert('users', rows)
        .then(() => resolve())
        .catch(error => {
            console.log('Error adding user. Might already exist.');
        });
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        db.select().table('users')
        .then(function(rows) {
            resolve(rows);
        });
    });
}

function getProducts() {
    return new Promise((resolve, reject) => {
        db.select().table('advertise_item')
        .then(function(rows) {
            resolve(rows);
        });
    });
}

function test() {
    db.select().table('users')
    .then(function(rows) {
        console.log(rows);
    });
}

export default {
    test,
    insertUsers, 
    insertAdverts,
    getUsers,
    generateBids,
    generateBidsForAllProducts,
    getProducts
}
