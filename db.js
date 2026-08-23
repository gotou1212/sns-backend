const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.NODE_ENV === "test" ? ":memory:" : "./test.db";
const db = new sqlite3.Database(DB_PATH);

const INITIALIZE_SQL = `
CREATE TABLE IF NOT EXISTS test (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT
);`;

const CREATE_POSTS_TABLE = `
CREATE TABLE IF NOT EXISTS posts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER
);
`;

const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);
`;

const CREATE_UNIQUE_USERNAME_INDEX = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
`;

const CREATE_FOLLOWS_TABLE = `
CREATE TABLE IF NOT EXISTS follows(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  followee_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, followee_id),
  CHECK(follower_id <> followee_id),
  FOREIGN KEY (follower_id) REFERENCES users(id),
  FOREIGN KEY (followee_id) REFERENCES users(id)
);
`;

const CREATE_FOLLOW_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id);
`;

function ensurePostColumns() {
  db.all("PRAGMA table_info(posts)", (err, columns) => {
    if (err) {
      return;
    }

    const columnNames = columns.map((column) => column.name);
    if (!columnNames.includes("user_id")) {
      db.run("ALTER TABLE posts ADD COLUMN user_id INTEGER");
    }
  });
}

db.serialize(() => {
  db.run(INITIALIZE_SQL);
  db.run(CREATE_POSTS_TABLE);
  db.run(CREATE_USERS_TABLE);
  db.run(CREATE_UNIQUE_USERNAME_INDEX);
  db.run(CREATE_FOLLOWS_TABLE);
  db.run(CREATE_FOLLOW_INDEXES);
  ensurePostColumns();
});

db.getAsync = function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

db.allAsync = function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

db.runAsync = function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
};

module.exports = db;