import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import { config } from './config/index';
import AdminRoute from './api/routes/AdminRoute'
import UserRoute from './api/routes/UserRoute'
//import './api/seeds/InitialDataSeed';

const app = express();
const PORT = 5000;

mongoose
    .connect(config.dbUrl)
    .then(() => {
        console.log('Connected to the Database successfully');
    })
    .catch((err) => {
        console.log(`Error connecting to database - ${err}`)
    });

app.use(bodyParser.json())

/* Health check
    @return Object
*/
app.get('/', (req, res) => {
  res.send({status:"OK"});
});

app.use('/admin', AdminRoute);
app.use('', UserRoute)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});