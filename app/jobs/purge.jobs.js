import db from '../models/index.js';
import { getDateAgo } from '../utils/utils.js';

const { Op } = db.Sequelize;
const ADMSModels = db.models.adms;

async function purgeLogs(age) {
    const deletedRows = await ADMSModels.ADMSLogs.destroy({
        where: {
            createdAt: {
                [Op.lt]: getDateAgo(age)
            }
        }
    });
    return deletedRows;
}

async function purgeCommandBuffer(age) {
    const deletedRows = await ADMSModels.ADMSCommandBuffer.destroy({
        where: {
            [Op.and]: [
                { createdAt: { [Op.lt]: getDateAgo(age) } },
                { status: { [Op.or]: ['SUCCESS', 'FAILURE'] } }
            ]
        }
    });
    return deletedRows;
}

async function purgeAttendance(age) {
    const deletedRows = await ADMSModels.ADMSAttendance.destroy({
        where: {
            createdAt: {
                [Op.lt]: getDateAgo(age)
            }
        }
    });
    return deletedRows;
}

async function purgeMachines(age) {
    const purgedMachines = await ADMSModels.ADMSMachine.findAll({
        where: {
            last_seen: {
                [Op.lt]: getDateAgo(age)
            }
        }
    });

    const serialNumbers = purgedMachines.map(machine => machine.serial_number);

    if (serialNumbers.length == 0) return 0;
        
    await ADMSModels.ADMSCommandBuffer.destroy({
        where: {
            serial_number: {
                [Op.in]: serialNumbers
            }
        }
    });

    const deletedRows = await ADMSModels.ADMSMachine.destroy({
        where: {
            last_seen: {
                [Op.lt]: getDateAgo(age)
            }
        }
    });

    return deletedRows;
}


export default async function purgeData() {
    try {
        console.log(`${new Date().toISOString()} [INFO] Running data purge! (${new Date()})`);
        if (+process.env.LOGS_PURGE) {
            const logsDeleted = await purgeLogs(process.env.LOGS_PURGE_AGE);
            console.log(`${new Date().toISOString()} [INFO] Number of logs deleted: ${logsDeleted}`);
        }
        if (+process.env.COMMAND_PURGE) {
            const commandDeleted = await purgeCommandBuffer(process.env.COMMAND_PURGE_AGE);
            console.log(`${new Date().toISOString()} [INFO] Number of command log deleted: ${commandDeleted}`);
        }
        if (+process.env.ATTENDANCE_PURGE) {
            const attendanceDeleted = await purgeAttendance(process.env.ATTENDANCE_PURGE_AGE);
            console.log(`${new Date().toISOString()} [INFO] Number of attendance log deleted: ${attendanceDeleted}`);
        }
        if (+process.env.MACHINE_PURGE) {
            const machinesDeleted = await purgeMachines(process.env.MACHINE_PURGE_AGE);
            console.log(`${new Date().toISOString()} [INFO] Number of machines deleted: ${machinesDeleted}`);
        }
    } catch (error) {
        console.error(`${new Date().toISOString()} [ERROR] Data purge failed: ${error.message}`);
    }
    
}