import Dexie from 'dexie';

export interface GTrakDBSchema {
  // define tables here
}

export const db = new Dexie('gtrak');

db.version(1).stores({
  // example: items: '++id, name, createdAt'
});

export default db;
