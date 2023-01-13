const express = require("express");
const app = express();
const dotenv=require('dotenv').config()
const mongoose=require('./config/dbConfig')
app.use(express.json());
const userRoute=require('./routes/userRouter')
const adminRoute=require('./routes/adminRouter')


app.use('/api/user',userRoute);
app.use('/api/admin',adminRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listen on port ${port}`));
