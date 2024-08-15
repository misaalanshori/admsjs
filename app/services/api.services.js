import db from '../models/index.js';

const APIModels = db.models.api

import { getTimezoneOffsetString } from '../utils/utils.js';

async function attendanceHookHandler(attendanceData, machine) {
    const hookData = attendanceData.map(v => ({
        id: v.pin,
        date: new Date(v.date + getTimezoneOffsetString(machine.timezone))
    }))
    const attendanceHooks = await APIModels.APIAttendanceHook.findAll();
    console.log(`Handling ${attendanceHooks.length} hooks`)
    attendanceHooks.forEach(async (hook) => {
        const hookRequest = await fetch(hook.url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${hook.token}`
                },
                body: JSON.stringify(hookData),
            }
        );
        if (200 <= hookRequest.status < 300) {
            console.log(`Hook Call to ${hook.url} succeded! (${hookRequest.status}, Count: ${hookData.length})`)
        } else {
            console.log(`Hook Call to ${hook.url} failed! (${hookRequest.status})`)
        }
    });
}

const APIServices = {
    attendanceHookHandler,
};

export default APIServices;