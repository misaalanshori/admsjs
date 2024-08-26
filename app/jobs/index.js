import schedule from "node-schedule";

import batchedAttendanceHookHandler from "./attendancehook.jobs.js";

export default function initScheduledJobs() {
    if (!+process.env.REALTIME_SYNC_MODE) {
        schedule.scheduleJob(process.env.BATCHED_SYNC_SCHEDULE, batchedAttendanceHookHandler)
    }

    return schedule.scheduledJobs;
}