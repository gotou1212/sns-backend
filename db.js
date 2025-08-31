const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./test.db");

const INITALIZE_SQL =`
CREATE TABLE IF NOT EXISTS  test (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT
 );`;

const CREATE_POSTS_TABLE = `
 CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
   title TEXT NOT NULL,
   content TEXT NOT NULL
 );
`;
   

db.serialize(() => {
    db.run(INITALIZE_SQL)
    db.run(CREATE_POSTS_TABLE);
});

module.exports = db;