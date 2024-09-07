import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import forceText from './app/middlewares/forceText.middlewares.js';
import { machineWhitelist } from './app/middlewares/machineWhitelist.middlewares.js';

import db from './app/models/index.js';

import initScheduledJobs from './app/jobs/index.js';

import IClockRouter from './app/routes/iclock.routes.js';
import APIRouter from './app/routes/api.routes.js';
import ADMSRouter from './app/routes/adms.routes.js';
import { authenticatedRoute } from './app/middlewares/authenticatedRoute.middlewares.js';

const port = process.env.APP_PORT

const app = express();

app.use(cors());

app.use("/iclock", [forceText, machineWhitelist, IClockRouter]);
app.use("/api", [express.json(), APIRouter]);
app.use("/adms", [express.json(), authenticatedRoute, ADMSRouter]);

db.database.sync().then(()=>{
    console.log(initScheduledJobs());
    app.listen(port, () => console.log(`App listening on port http://localhost:${port}!`) );
});