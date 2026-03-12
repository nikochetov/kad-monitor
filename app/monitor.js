import axios from "axios";
import {telegramActions} from "./telegram.js";
import scheduleTask from './scheduler.js'
import {API_KEY, API_URL} from "../const/api.js";
import {dbService} from "./db-service.js";
import {INN} from "../const/inn.js";
import {Status} from "../const/status.js";

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
        const {data, meta} = responseData

        const {status, message} = meta;

        if (status === Status.Error) {
            throw Error(message)
        }

        return {cases: data['Записи'] ?? [], status};

    } catch (e) {
        sendTGMessage(`⚠️При получении списка дел произошла ошибка: ${e.message}⚠️`)
        return {cases: [], status: Status.Error};
    }
}

async function check() {
    const db = dbService.load()
    const updates = await getUpdates();

    const {cases, status} = await getCases(inn);

    if (!cases.length && status === Status.Success) {
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