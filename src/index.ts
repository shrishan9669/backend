import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors'; // Use ES module import

import userRouter from './user';
import adminRouter from './admin';

const app = express();

// Refine CORS setup
app.use(cors());

// Middleware
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: true ,limit:'50mb'}));

// Routers
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Serve static files


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
