"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const adminRouter = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, ''); // Directory where files will be stored
        },
        filename: (req, file, cb) => {
            // Set a placeholder for the file name. We'll update this after creating the document
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});
adminRouter.post('/pdfspost', upload.single('pdf'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const file = req.file;
    console.log(body);
    console.log(file);
    if (!file) {
        return res.status(400).json({ msg: "No file uploaded!" });
    }
    if (file.mimetype != 'application/pdf') {
        fs_1.default.unlinkSync(file.path); // Delete the file if it's not a PDF
        return res.status(400).json({ msg: "Uploaded file is not a PDF!" });
    }
    try {
        const updated = yield prisma.student.update({
            where: {
                id: Number(body.studentid)
            },
            data: {
                contributions: {
                    increment: 1
                }
            }
        });
        const document = yield prisma.papers.create({
            data: {
                type: body.type,
                course: body.course,
                semester: Number(body.semester),
                pdf: Buffer.from([]),
                subject: body.subject,
                studentid: Number(body.studentid)
            }
        });
        const paperId = document.id;
        const newFileName = body.customName + paperId + '.pdf';
        const newFilePath = `${newFileName}`;
        fs_1.default.renameSync(file.path, newFilePath);
        const pdfBuffer = fs_1.default.readFileSync(newFilePath);
        yield prisma.papers.update({
            where: { id: paperId },
            data: { pdf: pdfBuffer }
        });
        return res.json({
            msg: "File uploaded..",
            totalcontributions: updated.contributions
        });
    }
    catch (err) {
        console.error("Error while..posting pdf!!->", err);
    }
}));
adminRouter.get("/pdfdownload", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pdfid = req.query.pdfid;
    try {
        const document = yield prisma.papers.findUnique({
            where: {
                id: Number(pdfid)
            }
        });
        console.log(document);
        if (document) {
            const pdfbuffer = Buffer.from(document.pdf);
            res.setHeader('Content-Disposition', `attachment; filename="${document.subject}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfbuffer);
        }
        else {
            return res.json({
                msg: "Document not found!!"
            });
        }
    }
    catch (err) {
        console.error("Error while downloading..pdf->", err);
    }
}));
adminRouter.get("/findpdfs", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parameters = req.query;
    console.log(parameters);
    try {
        const Findall = yield prisma.papers.findMany({
            where: {
                semester: Number(parameters.semester),
                course: parameters.course
            }
        });
        console.log(Findall);
        if (Findall) {
            return res.json({
                msg: "Found pdfs!!",
                all: Findall
            });
        }
        else {
            return res.json({
                msg: "No document exist..",
                all: []
            });
        }
    }
    catch (err) {
        console.error("Error while getting all pdfs!!->", err);
    }
}));
adminRouter.delete('/deleteall', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.papers.deleteMany({});
        yield prisma.student.deleteMany({});
        res.json({ msg: "Allpapers and student  deleted!!" });
    }
    catch (err) {
        console.error(err);
    }
}));
adminRouter.post('/updatename', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const name = req.query.name;
    try {
        const New = yield prisma.student.update({
            where: {
                id: Number(id)
            },
            data: {
                name: name
            }
        });
        res.json({
            newname: New.name
        });
    }
    catch (err) {
        console.error(err);
    }
}));
exports.default = adminRouter;
