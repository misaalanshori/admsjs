import db from '../models/index.js';

const APIModels = db.models.api

import { getTimezoneOffsetString } from '../utils/utils.js';

async function attendanceHookHandler(attendanceData, machine) {
    const handleTime = new Date();
    const hookData = attendanceData.map(v => ({
        id: v.pin,
        date: new Date(v.date + getTimezoneOffsetString(machine.timezone))
    }))
    const attendanceHooks = await APIModels.APIAttendanceHook.findAll();
    console.log(`${new Date().toISOString()} [INFO] Handling ${attendanceHooks.length} hooks`)
    attendanceHooks.forEach(async (hook) => {
        try {
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
                console.log(`${new Date().toISOString()} [INFO] Hook Call to ${hook.url} succeded! (${hookRequest.status}, Count: ${hookData.length})`)
                hook.last_sync = handleTime;
                hook.save();
            } else {
                console.log(`${new Date().toISOString()} [ERROR] Hook Call to ${hook.url} failed! (${hookRequest.status})`)
            }
        } catch (err) {
            console.log(`${new Date().toISOString()} [ERROR] Hook Call to ${hook.url} failed! (${err.toString()})`)
        }
    });
}

export {
    attendanceHookHandler,
};