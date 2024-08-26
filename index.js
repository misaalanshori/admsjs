import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import forceText from './app/middlewares/forceText.js';
import { machineWhitelist } from './app/middlewares/machineWhitelist.middleware.js';

import db from './app/models/index.js';

import IClockRouter from './app/routes/iclock.js';
import APIRouter from './app/routes/api.js';
import initScheduledJobs from './app/jobs/index.js';

const port = process.env.APP_PORT

const app = express();

app.use(cors());

app.use("/iclock", [forceText, machineWhitelist, IClockRouter]);
app.use("/api", [express.json(), APIRouter]);

db.database.sync({alter: true}).then(()=>{
    console.log(initScheduledJobs());
    app.listen(port, () => console.log(`App listening on port http://localhost:${port}!`) );
});