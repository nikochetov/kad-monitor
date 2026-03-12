import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config()

const schedulerPattern = '0 8-21 * * 1-5'
const timezone = process.env.TIMEZONE

export default (taskFn) => {
    cron.schedule(schedulerPattern, taskFn, {timezone})
}