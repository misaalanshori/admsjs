import db from '../models/index.js';
import batchedAttendanceHookHandler from '../jobs/attendancehook.jobs.js';

const { Op } = db.Sequelize;
const APIModels = db.models.api
const ADMSModels = db.models.adms

async function checkMachineWhitelist(serial_number) {
    if (+process.env.WHITELIST) {
        return await APIModels.APIMachine.findOne({ where: {serial_number} })
    } else {
        return {
            serial_number,
            timezone: +process.env.DEFAULT_TZ
        }
    }
    ;

}

async function handleMachineHeartbeat(serial_number) {
    const machine = await ADMSModels.ADMSMachine.findOne({ where: {serial_number} });
    if (machine) {
        machine.last_seen = new Date();
        machine.save()
    } else {
        ADMSModels.ADMSMachine.create({
            serial_number: serial_number,
            last_seen: new Date(),
        })
    }
}

async function handleAttendanceReceived(serialNumber, admsAttendance) {
    await ADMSModels.ADMSAttendance.bulkCreate(admsAttendance.map(v => ({
        pin: v.pin,
        date: v.date,
        status: v.status,
        raw: v.raw,
        serial_number: serialNumber,
    })))
    if (+process.env.REALTIME_SYNC_MODE) {
        await batchedAttendanceHookHandler();
    }
}

async function handleCommandResponseReceived(amdsCommandResponse) {
    const recvTime = new Date();
    const cmdRequests = await ADMSModels.ADMSCommandBuffer.findAll({where: {id: {[Op.in]: Object.keys(amdsCommandResponse)}}})
    cmdRequests.forEach(v=>{
        v.status = +(amdsCommandResponse[v.id].Return) >= 0 ? "SUCCESS" : "FAILURE";
        v.results = amdsCommandResponse[v.id];
        v.result_time = recvTime;
        v.save()
    })
}

async function sendCommmand(serialNumbers, commands, exclusionMode = false, userId) {
    const targets = [];

    if (commands.some(v=> !(v.header))) throw "Request contains invalid command";

    const MachineModelSource = +process.env.WHITELIST ? APIModels.APIMachine : ADMSModels.ADMSMachine;

    if (!serialNumbers) {
        const broadcastMachines = await MachineModelSource.findAll();
        targets.push(...broadcastMachines.map(v=>v.serial_number));
    } else if (!exclusionMode) {
        targets.push(...serialNumbers);
    } else {
        const broadcastMachines = await MachineModelSource.findAll({where: {serial_number: {[Op.notIn]: serialNumbers}}});
        targets.push(...broadcastMachines.map(v=>v.serial_number));
    }

    const commandObjects = targets.flatMap(target => {
        return commands.map(cmd => ({
            serial_number: target,
            command: cmd,
            status: "SUBMITTED",
            apiUserId: userId
        }));
    });
    // console.log(targets)
    // console.log(commandObjects)

    return await ADMSModels.ADMSCommandBuffer.bulkCreate(commandObjects);
}

async function handleFingerprintSync(serialNumber, data) {
    const command = {
        header: [
            "DATA",
            "UPDATE",
            "FINGERTMP"
        ],
        body: data
    };
    await sendCommmand([serialNumber], [command], true, null)
}

async function handleUserSync(serialNumber, data) {
    const command = {
        header: [
            "DATA",
            "UPDATE",
            "USERINFO"
        ],
        body: data
    };
    await sendCommmand([serialNumber], [command], true, null)
}

export {
    checkMachineWhitelist,
    handleMachineHeartbeat,
    handleAttendanceReceived,
    handleCommandResponseReceived,
    sendCommmand,
    handleFingerprintSync,
    handleUserSync,
}
