import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import IClockRouter from './app/routes/iclock.js';

const port = process.env.APP_PORT

const app = express();

app.use(cors());
app.use((req, res, next) => { // Body is always text 
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.body = data;
        next();
    });
});

app.use("/iclock", IClockRouter);

app.listen(port, () => console.log(`App listening on port http://localhost:${port}!`) )