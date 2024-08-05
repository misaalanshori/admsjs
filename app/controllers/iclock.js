/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

import util from 'util';
// let ATTLOGStamp = 0;
// let OPERLOGStamp = 0;
// let ATTPHOTOStamp = 0;

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
            `TimeZone=7`,
            `Realtime=1`,
            `Encrypt=None`,
        ].join("\r\n")

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
                    data: (handlers[operation] || table.default)(lineData)
                };
            });

            return operationData;
        }

        const handlers = {
            "ATTLOG": attLogHandler,
            "OPERLOG": operLogHandler,
            default: () => req.body,
        };

        data.data = (handlers[table] || table.default)();
        console.log("LOG: ", util.inspect(data, true, 10));

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
        console.log("HEARTBEAT: ", req.query);
        res.status(200);
        res.write(`OK`);
        res.end();
    },

    /**
     * Status Data controller (Command Response) [POST /devicecmd]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    statusData: async (req, res) => {
        console.log("Command Response: ", req.query);
        res.status(200);
        res.write(`OK`);
        res.end();
    }
}

export default IClockControllers