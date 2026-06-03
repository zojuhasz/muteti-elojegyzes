import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import operatingRoomsRouter from "./operatingRooms";
import surgeonsRouter from "./surgeons";
import surgeriesRouter from "./surgeries";
import dashboardRouter from "./dashboard";
import dailyRostersRouter from "./dailyRosters";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(operatingRoomsRouter);
router.use(surgeonsRouter);
router.use(surgeriesRouter);
router.use(dashboardRouter);
router.use(dailyRostersRouter);

export default router;
