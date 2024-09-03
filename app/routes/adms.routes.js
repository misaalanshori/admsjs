import { Router } from "express";

import ADMSCommandBufferController from "../controllers/admsCommandBuffer.controllers.js";
import ADMSCommandUserControllers from "../controllers/admsCommandUser.controllers.js";
import forceText from "../middlewares/forceText.middlewares.js";

const ADMSRouter = Router();

ADMSRouter.get("/command", ADMSCommandBufferController.getAll);
ADMSRouter.get("/command/:id", ADMSCommandBufferController.getOne);
ADMSRouter.post("/command", ADMSCommandBufferController.createBroadcast);
ADMSRouter.post("/command/:serial_number", ADMSCommandBufferController.create);
ADMSRouter.put("/command/:id", ADMSCommandBufferController.update);
ADMSRouter.delete("/command/:id", ADMSCommandBufferController.delete);

ADMSRouter.post("/command/addusers/csv", forceText, ADMSCommandUserControllers.createViaCSV);

export default ADMSRouter;