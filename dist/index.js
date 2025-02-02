"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // Use ES module import
const user_1 = __importDefault(require("./user"));
const admin_1 = __importDefault(require("./admin"));
const app = (0, express_1.default)();
// Refine CORS setup
app.use((0, cors_1.default)({
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // If you are using cookies or auth headers
}));
// Middleware
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Routers
app.use('/user', user_1.default);
app.use('/admin', admin_1.default);
// Serve static files
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
