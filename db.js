const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./test.db");

const INITALIZE_SQL =`
CREATE TABLE IF NOT EXISTS test (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT
 );
`;
  
db.serialize(() => {
    db.run(INITALIZE_SQL)
});

module.exports = db;