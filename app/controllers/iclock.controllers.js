/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

import util from 'util';
import db from '../models/index.js';
import { attendanceHookHandler } from '../services/api.services.js';
import {
    handleMachineHeartbeat,
    handleUserReceived,
    handleFingerprintReceived,
    handleAttendanceReceived,
    handleCommandResponseReceived,
    handleFingerprintSync,
    handleUserSync,
} from '../services/adms.services.js';
import { buildADMSCommand } from '../utils/utils.js';

const ADMSModels = db.models.adms;

const TransFlags = [
    "AttLog", // Attendance log
    "OpLog", // Operation log
    // "AttPhoto", // Attendance photo
    "EnrollUser", // Enrolling a new user
    "ChgUser", // Changing user information
    "EnrollFP", // Enrolling a new fingerprint
    "ChgFP", // Changing a fingerprint
    "FPImag", // Fingerprint image
    // "FACE", // New enrolled face
    // "UserPic" // Userpicture
];

const OpTypes = [
    "Startup",
    "Shutdown",
    "Authentication fails",
    "Alarm",
    "Access menu",
    "Change settings",
    "Enroll fingerprint",
    "Enroll password",
    "Enroll HID card",
    "Delete user",
    "Delete fingerprint",
    "Delete password",
    "Delete RF card",
    "Clear data",
    "Create MF card",
    "Enroll MF card",
    "Register MF card",
    "Delete MF card registration",
    "Clear MF card content",
    "Move enrolled data into the card",
    "Copy data in the card to the machine",
    "Set time",
    "Delivery configuration",
    "Delete entry and exit records",
    "Clear administrator privilege"
]


const IClockControllers = {
    /**
     * Handshake controller [GET /cdata]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    handshake: async (req, res) => {
        const serialNumber = req.query.SN;
        handleMachineHeartbeat(serialNumber);
        const response = [
            `GET OPTION FROM: ${serialNumber}`,
            `STAMP=9999`,
            `ATTLOGSTAMP=${Math.floor(Date.now() / 1000)}`,
            `OPERLOGStamp=${Math.floor(Date.now() / 1000)}`,
            `ATTPHOTOStamp=${Math.floor(Date.now() / 1000)}`,
            `ErrorDelay=30`,
            `Delay=10`,
            `TransTimes=00:00;23:59`,
            `TransInterval=1`,
            `TransFlag=TransData ${TransFlags.join("\t")}`,
            `TimeZone=${req.machine.timezone}`,
            `Realtime=1`,
            `Encrypt=None`,
        ].join("\r\n")

        console.log(`${new Date().toISOString()} [INFO] Received Handshake:`)
        console.log(req.query);
        console.log(response);

        res.status(200);
        res.write(response);
        res.end();
    },

    /**
     * Receive Data controller [POST /cdata]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    receiveData: async (req, res) => {
        const serialNumber = req.query.SN;
        const table = req.query.table;
        const bodyLines = req.body.replace(/^[ \n\r\f]+|[ \n\r\f]+$/g, '').split("\n");

        const data = {
            serialNumber,
            table,
        };

        const attLogHandler = () => {
            const bodyData = bodyLines.map(v => v.split("\t"));
            const attLog = bodyData.map(v => ({
                pin: v[0],
                date: v[1],
                status: v[2],
                verify: v[3],
                workCode: v[4],
                reserved1: v[5],
                reserved2: v[6],
            }));
            handleAttendanceReceived(serialNumber, attLog, req.machine)
            if (+process.env.REALTIME_SYNC_MODE) {
                attendanceHookHandler(attLog, req.machine);
            }

            return attLog;
        };

        const operLogHandler = () => {
            const opLogHandler = (lineData) => {
                return {
                    type: lineData[0],
                    status: lineData[1],
                    date: lineData[2],
                    pin: lineData[3],
                    value1: lineData[4],
                    value2: lineData[5],
                    value3: lineData[6],
                }
            };

            const userHandler = (lineData) => {
                let data = {};
                lineData.forEach(v => {
                    const pair = v.split("=");
                    data = {
                        ...data,
                        [pair[0]]: pair[1]
                    }
                });
                handleUserReceived(serialNumber, data)
                handleUserSync(serialNumber, data);
                return data;
            };

            const fpHandler = (lineData) => {
                let data = {};
                lineData.forEach(v => {
                    const [key, ...rest] = v.split("=");
                    const value = rest.join("=");
                    data = {
                        ...data,
                        [key]: value
                    };
                });
                handleFingerprintReceived(serialNumber, data);
                handleFingerprintSync(serialNumber, data);
                return data;
            };

            const handlers = {
                "OPLOG": opLogHandler,
                "USER": userHandler,
                "FP": fpHandler,
                default: (v) => v,
            };

            const operationData = bodyLines.map(v => {
                const [operation, ...rest] = v.split(' ');
                const lineData = rest.join(' ').split("\t");
                return {
                    operation,
                    data: (handlers[operation] || handlers.default)(lineData)
                };
            });

            return operationData;
        }

        const cmdResponseHandler = () => {
            const recvTime = new Date();
            const cmdResponses = {}
            bodyLines.forEach(v=>{
                const response = {}
                v.split("&").forEach(v=>{
                    const [key, value] = v.split("=");
                    response[key] = value;
                })
                cmdResponses[response.ID] = response
            })
            console.log(cmdResponses)
            handleCommandResponseReceived(cmdResponses)
            return Object.values(cmdResponses)
        }

        const handlers = {
            "ATTLOG": attLogHandler,
            "OPERLOG": operLogHandler,
            default: () => req.body,
        };

        if (!table) {
            data.data = cmdResponseHandler();
        } else {
            data.data = (handlers[table] || handlers.default)();
        }

        
        console.log(`${new Date().toISOString()} [INFO] Machine Event: `, util.inspect(data, true, 10));

        res.status(200);
        res.write(`OK: ${bodyLines.length}`);
        res.end();
    },

    /**
     * Send Data controller (Heartbeat, Send Command) [GET /getrequest]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    sendData: async (req, res) => {
        const serialNumber = req.query.SN;
        console.log(`${new Date().toISOString()} [INFO] HEARTBEAT: `, req.query);
        handleMachineHeartbeat(serialNumber);
        const commands = await ADMSModels.ADMSCommandBuffer.findAll({
            where: {
            serial_number: serialNumber,
            status: 'SUBMITTED'
            },
            order: [['createdAt', 'ASC']],
            limit: +process.env.MAX_COMMAND_PER_REQUEST
        });
        // commands.forEach(v => {
        //     console.log(buildADMSCommand(v.id, v.command))
        // })
        res.status(200);
        if (commands.length > 0) {
            commands.forEach((v) => {
                try {
                    res.write(buildADMSCommand(v.id, v.command));
                    res.write("\n");
                    v.status = "EXECUTING";
                    v.execution_time = new Date();
                    v.save();
                } catch (err) {
                    console.log(`${new Date().toISOString()} [ERROR] Error while sending command: ${err}`);
                    v.results = {err: err.toString()}
                    v.status = "FAILURE";
                    v.execution_time = new Date();
                    v.save();
                }
                
            })
        } else {
            res.write(`OK`);
        }
        res.end();
    },

    /**
     * Status Data controller [POST /devicecmd]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    statusData: async (req, res) => {
        console.log(`${new Date().toISOString()} [INFO] /devicecmd: `, req.query);
        res.status(200);
        res.write(`OK`);
        res.end();
    }
}

export default IClockControllers