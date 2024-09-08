import schedule from "node-schedule";

import batchedAttendanceHookHandler from "./attendancehook.jobs.js";
import purgeData from "./purge.jobs.js";

export default function initScheduledJobs() {
    if (!+process.env.REALTIME_SYNC_MODE) {
        schedule.scheduleJob(process.env.BATCHED_SYNC_SCHEDULE, batchedAttendanceHookHandler)
    }

    if (+process.env.DATA_PURGE) {
        schedule.scheduleJob(process.env.DATA_PURGE_SCHEDULE, () => {setTimeout(purgeData,2000)})
    }

    return schedule.scheduledJobs;
}