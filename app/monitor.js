import axios from "axios";
import {telegramActions} from "./telegram.js";
import scheduleTask from './scheduler.js'
import {API_KEY, API_URL} from "../const/api.js";
import {dbService} from "./db-service.js";
import {INN} from "../const/inn.js";

const inn = INN;

const sendTGMessage = async (text) => {
    await telegramActions.sendMessage(text);
}

const getUpdates = async () => {
    try {
        const response = await telegramActions.getUpdates();
        return response.result;
    } catch (e) {
        sendTGMessage(`⚠️При получении сообщений произошла ошибка ${e}⚠️`);
        return [];
    }
}

const getCases = async () => {
    try {
        const res = await axios.get(
            API_URL,
            {
                params: {
                    key: API_KEY,
                    inn,
                }
            }
        );

        const {data: responseData} = res;

        return responseData.data['Записи'] || [];

    } catch (e) {
        sendTGMessage(`⚠️При получении списка дел произошла ошибка ${e}⚠️`)
        return [];
    }
}

async function check() {
    const db = dbService.load()
    const updates = await getUpdates();

    const cases = await getCases(inn);

    if (!cases.length) {
        await sendTGMessage(`🐀Крысиных дел по ИНН ${inn} нет`)
    }

    for (const c of cases) {
        if (!db.cases.includes(c['Номер'])) {
            db.cases.push(c['Номер']);

            await sendTGMessage(`🚨💥Найдено дело ${c['Номер']}💥🚨
                🤡Суд: ${c['Суд']} 💩
                🤡Дата: ${c['Дата']} 💩`);
        } else {
            await sendTGMessage(`🚨Есть крысиное дело🚨`)
        }
    }

    dbService.save(db);
}

export default () => {
    scheduleTask(check)
}