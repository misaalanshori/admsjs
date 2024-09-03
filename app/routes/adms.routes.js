import { Router } from "express";

import ADMSCommandBufferController from "../controllers/admsCommandBuffer.controllers.js";

const ADMSRouter = Router();

ADMSRouter.get("/command", ADMSCommandBufferController.getAll);
ADMSRouter.get("/command/:id", ADMSCommandBufferController.getOne);
ADMSRouter.post("/command", ADMSCommandBufferController.createBroadcast);
ADMSRouter.post("/command/:serial_number", ADMSCommandBufferController.create);
ADMSRouter.put("/command/:id", ADMSCommandBufferController.update);
ADMSRouter.delete("/command/:id", ADMSCommandBufferController.delete);

export default ADMSRouter;