import immutable from 'immutable';
import fs from 'fs';
import db from './database';
import util from './util';

const USERNAME_FILE = 'misc/usernames.json';
const FURNITURE_FILE = 'data/furniture.json';
const APPLIANCE_FILE = 'data/appliance.json';
const TOOL_FILE = 'data/tool.json';
const BOOK_FILE = 'data/book.json';

const FILES = [{
    type: 'Furniture',
    path: FURNITURE_FILE
}, {
    type: 'Appliance',
    path: APPLIANCE_FILE
}, {
    type: 'Tool',
    path: TOOL_FILE
}, {
    type: 'Book',
    path: BOOK_FILE
}];

let products = [];
let users = [];         // users from database
let s_usernames = [];     // users from source
let s_products = [];

app();

function app() {
    console.log('[*] stuffy-seed started! :D');

    let promises = [];
    FILES.map(file => {
        promises.push(addSourceProducts(file.path, file.type));
    });
    Promise.all(promises).then(() => {
        console.log('Products read: ' + s_products.length);
        getUsernamesFromSourceProducts(s_products);
        console.log('Usernames read: ' + s_usernames.length);

        return db.insertUsers(s_usernames);
    }).then(() => {
        console.log('Users inserted.');
        return db.insertAdverts(s_products, s_usernames);
    }).then(() => {
        console.log('Advertisements inserted.');
        return db.getProducts();
    }).then(rows => {
        products = rows;
        console.log('Advertisements obtained from database.');
        return db.getUsers();
    }).then(rows => {
        users = rows;
        console.log('Users obtained from database.');
        return db.generateBidsForAllProducts(products, users);
    }).then(() => {
        console.log('Bids generated');

        console.log('All done!');
    });
}

function addSourceProducts(file, type) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, function(err, data) {
            const json = JSON.parse(data);
            Object.keys(json).map(key => {
                const product = {
                    title: json[key].title.split('\n')[0],
                    price: parseInt(json[key].price),
                    description: json[key].description,
                    type: type,
                    seller: {
                        username: json[key].seller.username,
                        first_name: json[key].seller.first_name,
                        last_name: json[key].seller.last_name,
                        location_address: json[key].location_address
                    }
                };
                s_products.push(product);
            });
            resolve();
        });
    });
}

function getUsernamesFromSourceProducts(products) {
    let history = []
    Object.keys(products).map(key => {
        const username = products[key].seller.username;
        let exists = false;

        if (history.indexOf(username) >= 0) {
            exists = true;
        }

        if (!exists) {
            const user = {
                username: products[key].seller.username,
                first_name: products[key].seller.first_name,
                last_name: products[key].seller.last_name,
                location_address: products[key].seller.location_address
            };
            s_usernames.push(user);
            history.push(username);
        }
    });
}
