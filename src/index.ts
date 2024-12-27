import express ,{Request,Response,NextFunction} from 'express'

const app = express();
const cors = require('cors');


import userRouter from './user'
import adminRouter from './admin';
import path from 'path';
app.use(cors());
app.use(express.json());

app.use('/user',userRouter);
app.use('/admin',adminRouter)

app.use(express.urlencoded({ extended: true }));

console.log("Serving static files from: ", path.join(__dirname, ""));

    app.use('/pdfpreview',express.static(path.join(__dirname,"")))
app.listen(3000,()=>{
    console.log("Server is running on port " + 3000);
})



