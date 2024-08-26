import { Router } from "express";
import { authenticatedRoute } from "../middlewares/authenticatedRoute.middlewares.js";
import APIAuthControllers from "../controllers/apiAuthentication.controllers.js";
import APIMachinesController from "../controllers/apiMachines.controllers.js";
import APIAttendanceHookController from "../controllers/apiAttendanceHook.controllers.js";

const APIRouter = Router();

APIRouter.post("/login", APIAuthControllers.login);
APIRouter.post("/register", APIAuthControllers.register);
APIRouter.get("/logout", authenticatedRoute, APIAuthControllers.logout);
APIRouter.get("/user", authenticatedRoute, APIAuthControllers.getUser);
APIRouter.put("/user", authenticatedRoute, APIAuthControllers.updateUser);

APIRouter.get("/machines", authenticatedRoute, APIMachinesController.getAll);
APIRouter.get("/machines/:id", authenticatedRoute, APIMachinesController.getOne);
APIRouter.post("/machines", authenticatedRoute, APIMachinesController.create);
APIRouter.put("/machines/:id", authenticatedRoute, APIMachinesController.update);
APIRouter.delete("/machines/:id", authenticatedRoute, APIMachinesController.delete);

APIRouter.get("/attendancehook", authenticatedRoute, APIAttendanceHookController.getAll);
APIRouter.get("/attendancehook/:id", authenticatedRoute, APIAttendanceHookController.getOne);
APIRouter.post("/attendancehook", authenticatedRoute, APIAttendanceHookController.create);
APIRouter.put("/attendancehook/:id", authenticatedRoute, APIAttendanceHookController.update);
APIRouter.delete("/attendancehook/:id", authenticatedRoute, APIAttendanceHookController.delete);

export default APIRouter;