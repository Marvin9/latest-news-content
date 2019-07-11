const Datastore = require('nedb');
const db = new Datastore('./server/database/_db.db');

db.loadDatabase();

module.exports = db;