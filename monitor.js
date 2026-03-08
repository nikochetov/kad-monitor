import axios from "axios";
import cron from "node-cron";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const API_KEY = process.env.API_KEY;
const API_URL = 'https://api.ofdata.ru/v2/legal-cases'

const inn = '366311196321'

const DB = "./db.json";

function loadDB() {
    return JSON.parse(fs.readFileSync(DB));
}

function saveDB(data) {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

async function sendTG(text) {
    await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            chat_id: CHAT_ID,
            text
        }
    );
}

async function searchCompany() {
  try {
    const res = await axios.get(
        API_URL,
        {
            params: {
                key: API_KEY,
                inn
            }
        }
    );
    const { data: responseData } = res;

    return responseData.data['Записи'] || [];
  
  } catch (e) {
   
     return [];
  }
}

async function check() {
    const db = loadDB();
    console.log("check:", inn);

    const cases = await searchCompany(inn);

        if(!cases.length) {
            await sendTG(
                `🐀Крысиных дел нет`
            )
        }

        for (const c of cases) {

            if (!db.cases.includes(c['Номер'])) {

                db.cases.push(c['Номер']);

                await sendTG(
                    `🚨💥Найдено дело ${c['Номер']}💥🚨 
                    🤡Суд: ${c['Суд']} 💩
                    🤡Дата: ${c['Дата']} 💩`
                );
            } else {
                await sendTG(
                    `🚨Есть крысиное дело🚨`
                )
            }
        }

    saveDB(db);
}

cron.schedule("0 5-18 * * *", check);
