import { checkMachineWhitelist } from '../services/adms.services.js';

async function machineWhitelist(req, res, next) {
    const serialNumber = req.query.SN;
    const machine = await checkMachineWhitelist(serialNumber);
    if (!machine) {
        console.log(`${new Date().toISOString()} [WARN] Unrecognized connection from: ${serialNumber} (${req.originalUrl.split("?")[0]})`);
        return res.status(403).send("Not Recognized");
    }
    req.machine = machine;
    next();
}

export { machineWhitelist };