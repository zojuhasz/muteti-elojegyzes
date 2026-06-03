import { Router, type IRouter } from "express";
import healthRouter from "./health";
import patientsRouter from "./patients";
import operatingRoomsRouter from "./operatingRooms";
import surgeonsRouter from "./surgeons";
import surgeriesRouter from "./surgeries";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(patientsRouter);
router.use(operatingRoomsRouter);
router.use(surgeonsRouter);
router.use(surgeriesRouter);
router.use(dashboardRouter);

export default router;
