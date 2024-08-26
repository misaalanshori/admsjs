import db from '../models/index.js';
import { getTimezoneOffsetString } from '../utils/utils.js';

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

export {
    checkMachineWhitelist,
    handleMachineHeartbeat,
    handleUserReceived,
    handleFingerprintReceived,
    handleAttendanceReceived
}
