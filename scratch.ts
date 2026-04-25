import Database from 'better-sqlite3';
const db = new Database('data/auth.db');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get());
