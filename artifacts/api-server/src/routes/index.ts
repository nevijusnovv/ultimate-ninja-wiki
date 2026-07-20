import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wikiRouter from "./wiki";
import sectionsRouter from "./sections";
import loreChaptersRouter from "./lore-chapters";
import adminAuthRouter from "./admin-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(wikiRouter);
router.use(sectionsRouter);
router.use(loreChaptersRouter);

export default router;
