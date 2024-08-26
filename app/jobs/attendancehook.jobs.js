import db from '../models/index.js';

const { Op } = db.Sequelize;
const APIModels = db.models.api;
const ADMSModels = db.models.adms;

export default async function batchedAttendanceHookHandler() {
    console.log(`${new Date().toISOString()} [INFO] Executing Scheduled Sync (${new Date()})`)
    const attendanceHooks = await APIModels.APIAttendanceHook.findAll();
    attendanceHooks.forEach(async (hook) => {
        const attendanceData = await ADMSModels.ADMSAttendance.findAll({
            where: {
                createdAt: {
                    [Op.gt]: hook.last_sync
                }
            }
        });

        if (attendanceData.length == 0) {
            console.log(`${new Date().toISOString()} [INFO] No new data for ${hook.url}`);
            return;
        }

        const hookData = attendanceData.map(v => (
            {
                id: v.pin,
                date: v.date,
            }
        ))

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
                console.log(`${new Date().toISOString()} [INFO] Batched Hook Call to ${hook.url} succeded! (${hookRequest.status}, Count: ${hookData.length})`)
                hook.last_sync = attendanceData.at(-1).createdAt;
                hook.save();
            } else {
                console.log(`${new Date().toISOString()} [ERROR] Batched Hook Call to ${hook.url} failed! (${hookRequest.status})`)
            }
        } catch (err) {
            console.log(`${new Date().toISOString()} [ERROR] Batched Hook Call to ${hook.url} failed! (${err.toString()})`)
        }
        
    })
}