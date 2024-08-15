import ADMSServices from '../services/adms.services.js';

async function machineWhitelist(req, res, next) {
    const serialNumber = req.query.SN;
    const machine = await ADMSServices.checkMachineWhitelist(serialNumber);
    if (!machine) {
        console.log(`[Warn] Unrecognized connection from: ${serialNumber} (${req.originalUrl.split("?")[0]})`);
        return res.status(403).send("Not Recognized");
    }
    req.machine = machine;
    next();
}

export { machineWhitelist };