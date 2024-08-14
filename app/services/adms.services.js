import db from '../models/index.js';

const APIModels = db.models.api

async function checkMachineWhitelist(serial_number) {
    const machineCount = await APIModels.APIMachine.count();
    if (machineCount == 0) return {
        timezone: process.env.DEFAULT_TZ
    };
    const machine = await APIModels.APIMachine.findOne({ where: {serial_number} })
    return machine;
}

const ADMSServices = {
    checkMachineWhitelist,
}

export default ADMSServices
