import db from '../models/index.js';
import { getTimezoneOffsetString } from '../utils/utils.js';

const { Op } = db.Sequelize;
const APIModels = db.models.api
const ADMSModels = db.models.adms

async function checkMachineWhitelist(serial_number) {
    const machineCount = await APIModels.APIMachine.count();
    if (machineCount == 0) return {
        serial_number,
        timezone: +process.env.DEFAULT_TZ
    };
    const machine = await APIModels.APIMachine.findOne({ where: {serial_number} })
    return machine;
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

async function handleUserReceived(serialNumber, admsUser) {
    let user;
    user = await ADMSModels.ADMSUser.findOne({ where: {pin: admsUser.PIN} })
    if (!user) {
        user = ADMSModels.ADMSUser.build();
        user.pin = +admsUser.PIN;
        const machine = await ADMSModels.ADMSMachine.findOne({ where: {serial_number: serialNumber} });
        if (machine) {
            user.admsMachineId = machine.id
        }
    }
    user.name = admsUser.Name;
    user.primary = admsUser.Pri;
    user.password = admsUser.Passwd;
    user.card = admsUser.Card;
    user.group = admsUser.Grp;
    user.timezone = admsUser.TZ;
    user.verify = admsUser.Verify;
    user.vice_card = admsUser.ViceCard;
    user.save();
}

async function handleFingerprintReceived(serialNumber, admsFingerprint) {
    let fingerprint;
    fingerprint = await ADMSModels.ADMSFingerprint.findOne({ where: {pin: admsFingerprint.PIN, fid: admsFingerprint.FID} });
    if (!fingerprint) {
        fingerprint = ADMSModels.ADMSFingerprint.build();
        fingerprint.pin = +admsFingerprint.PIN;
        fingerprint.fid = +admsFingerprint.FID;
        const machine = await ADMSModels.ADMSMachine.findOne({ where: {serial_number: serialNumber} });
        if (machine) {
            fingerprint.admsMachineId = machine.id
        }
    }
    fingerprint.size = +admsFingerprint.Size;
    fingerprint.valid = admsFingerprint.Valid;
    fingerprint.template = admsFingerprint.TMP;
    fingerprint.save();
}

async function handleAttendanceReceived(serialNumber, admsAttendance, machine) {
    const admsMachine = await ADMSModels.ADMSMachine.findOne({ where: {serial_number: serialNumber} });
    const attendance = ADMSModels.ADMSAttendance.bulkCreate(admsAttendance.map(v => ({
        pin: v.pin,
        date: new Date(v.date + getTimezoneOffsetString(machine.timezone)),
        status: v.status,
        verify: v.verify,
        work_code: v.workCode,
        reserved_1: v.reserved1,
        reserved_2: v.reserved2,
        admsMachineId: admsMachine?.id || null,
    })))
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

    if (!serialNumbers) {
        const broadcastMachines = await ADMSModels.ADMSMachine.findAll();
        targets.push(...broadcastMachines.map(v=>v.serial_number));
    } else if (!exclusionMode) {
        targets.push(...serialNumbers);
    } else {
        const broadcastMachines = await ADMSModels.ADMSMachine.findAll({where: {serial_number: {[Op.notIn]: serialNumbers}}});
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

export {
    checkMachineWhitelist,
    handleMachineHeartbeat,
    handleUserReceived,
    handleFingerprintReceived,
    handleAttendanceReceived,
    handleCommandResponseReceived,
    sendCommmand,
}
