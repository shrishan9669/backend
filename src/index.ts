import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors'; // Use ES module import
import path from 'path';
import userRouter from './user';
import adminRouter from './admin';

const app = express();

// Refine CORS setup
app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // If you are using cookies or auth headers
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Serve static files
console.log('Serving static files from: ', path.join(__dirname, ''));
app.use('/pdfpreview', express.static(path.join(__dirname, '')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
