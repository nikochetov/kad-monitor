import fs from "fs";

const defaultDb = {
    cases: []
}

const DB = "./db.json";
export const dbService = {
    save: (data) => {
        fs.writeFileSync(DB, JSON.stringify(data, null, 2));
    },
    load: () => {
        return JSON.parse(fs.readFileSync(DB));
    },
    clear: () => {
        fs.writeFileSync(DB, JSON.stringify(defaultDb, null, 2));
    }
}