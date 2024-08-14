import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import forceText from './app/middlewares/forceText.js';

import db from './app/models/index.js';

import IClockRouter from './app/routes/iclock.js';
import APIRouter from './app/routes/api.js';

const port = process.env.APP_PORT

const app = express();

app.use(cors());

app.use("/iclock", [forceText, IClockRouter]);
app.use("/api", [express.json(), APIRouter]);

db.database.sync({alter: true}).then(()=>{
    app.listen(port, () => console.log(`App listening on port http://localhost:${port}!`) )
});