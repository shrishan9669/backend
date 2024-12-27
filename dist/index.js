"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors = require('cors');
const user_1 = __importDefault(require("./user"));
const admin_1 = __importDefault(require("./admin"));
const path_1 = __importDefault(require("path"));
app.use(cors());
app.use(express_1.default.json());
app.use('/user', user_1.default);
app.use('/admin', admin_1.default);
app.use(express_1.default.urlencoded({ extended: true }));
console.log("Serving static files from: ", path_1.default.join(__dirname, ""));
app.use('/pdfpreview', express_1.default.static(path_1.default.join(__dirname, "")));
app.listen(3000, () => {
    console.log("Server is running on port " + 3000);
});
