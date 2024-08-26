import { Router } from "express";
import IClockControllers from "../controllers/iclock.controllers.js";

const IClockRouter = Router();

IClockRouter.get("/cdata", IClockControllers.handshake);
IClockRouter.post("/cdata", IClockControllers.receiveData);
IClockRouter.get("/getrequest", IClockControllers.sendData);
IClockRouter.post("/devicecmd", IClockControllers.receiveData);

export default IClockRouter;