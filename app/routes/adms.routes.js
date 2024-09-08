import { Router } from "express";

import ADMSCommandBufferController from "../controllers/admsCommandBuffer.controllers.js";
import ADMSCommandUserControllers from "../controllers/admsCommandUser.controllers.js";
import forceText from "../middlewares/forceText.middlewares.js";
import ADMSLogsController from "../controllers/admsLogs.controllers.js";
import ADMSFingerprint from "../controllers/admsFingerprint.controller.js";

const ADMSRouter = Router();

ADMSRouter.get("/command", ADMSCommandBufferController.getAll);
ADMSRouter.get("/command/:id", ADMSCommandBufferController.getOne);
ADMSRouter.post("/command", ADMSCommandBufferController.create);
ADMSRouter.put("/command/:id", ADMSCommandBufferController.update);
ADMSRouter.delete("/command/:id", ADMSCommandBufferController.delete);

ADMSRouter.post("/command/addusers/csv", forceText, ADMSCommandUserControllers.createViaCSV);

ADMSRouter.get("/logs", ADMSLogsController.getAll);
ADMSRouter.get("/logs/:id", ADMSLogsController.getOne);
ADMSRouter.delete("/logs", ADMSLogsController.bulkDelete);
ADMSRouter.delete("/logs/:id", ADMSLogsController.delete);

ADMSRouter.get("/fingerprint/sync", ADMSFingerprint.sync);
ADMSRouter.get("/fingerprint", ADMSFingerprint.getAll);
ADMSRouter.get("/fingerprint/:pin/:fid", ADMSFingerprint.getOne);
ADMSRouter.delete("/fingerprint/:pin/:fid", ADMSFingerprint.delete);


export default ADMSRouter;