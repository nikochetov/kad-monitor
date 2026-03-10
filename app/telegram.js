import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TG_API_URL = `https://api.telegram.org/bot`

export const telegramActions = {
    sendMessage: async (message) => await axios.post(
        `${TG_API_URL}${BOT_TOKEN}/sendMessage`,
        {
            chat_id: CHAT_ID,
            text: message
        }
    ),
    getUpdates: async () => await axios.get(
        `${TG_API_URL}${BOT_TOKEN}/getUpdates`
    )
}