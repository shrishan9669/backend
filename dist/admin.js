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
const multer_1 = __importDefault(require("multer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { google } = require("googleapis");
const dotenv = require("dotenv");
const stream = require("stream");
dotenv.config();
const adminRouter = (0, express_1.default)();
const prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
function Authentication(req, res, next) {
    let authheader;
    if (req.query.token) {
        authheader = req.query.token;
    }
    else
        authheader = req.headers['authorization'];
    const token = authheader && authheader.split(' ')[1];
    if (!token) {
        return res.send({ msg: "Access denied : No token provided" });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.send({ msg: "Invalid token" });
        }
        next();
    });
}
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage()
});
const KEYFILE_JSON = {
    "type": "service_account",
    "project_id": "upbeat-legacy-449513-q3",
    "private_key_id": "4e0eb7f182fc30bb0f291dde48549ddc09bed298",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCywXAbVTiw1RgF\n1PcSIaw3xB4OzeyTR3Mxkubql72Y21Hfp9qnBWBcUNGK+STy0JuhMDlB2AofGHO+\n0jJk2Rv2wuJszH5qWOj1WTGuqhR3VI+3tVAbMG2+/FBkPPezFWkPPxfDRi6N0SXE\nsLQqxt/laHOJx0bEbtQN9F/pmrowBmsqoysVT+eDUNJvIx9LAhmK0DhVcP7biEgV\n8RUbIGKLiReDpQ0geDxSlkaJSncD4vgAUtli6+VJB0GQVjyV2fCLmUbb9PXbqKao\nJz9lbtKwDxpKMNZa7NenmTxxXeYmlkham11bmNa5dc+iiiUrR4Ld+D7CcmIaf7AP\nlilIKWCpAgMBAAECggEAIZDhvnwu+EOXbnbqSxkQF+unckO4RgKfbqJlYo1KUKL0\nWZFRJVZE3Sje5B/7EG5cHvUpd0P8SJEEoQMi69152wkG0APJRCp8Wh/czK3KyIqU\nLxyolWZvYTLLXLs3DwV49CA2k9hAoygwFaJRvouYHOGTen51OysNfi5SeVDw39Xv\n+oMRTCsyDiIGI3Vm2v5kmv2LSzaGfwc2FPbJE5XOtdd0m5q9qAuKIvtMyR/Csnja\nFidoDaLAXJmJHg0LkhyDIWbqINPha1ayWG6sdRp6/6k6RS3YrRoy15G2h5vwAdBr\nWqm0bsj9KMC+QjGuSNp919BtXyYZL0COdAf8pjtJBQKBgQDsTfLZmWpKg9V2l8XS\np8fMi6bWcZILrViyZH68V2hkDt4SyEzXuUrBmLWmaJKtUO4pJ8t2SI+Znpv2Yl2f\ngP6iNxnUSuhtg9QLd1az4rpPT72nOnMBhqY7SOoTLvQ2r3pAmZy5nh0G6m4r/h33\n165h/1In/fyC/fJy8xnubXKDPQKBgQDBp5BFWeqR60aeciI9aue5MqUCtAYbLVwg\nK9yC2b2SyidXEQ3C+9KVpjHH2LBC2PzA2HzGCIV0B92lNfIMQxVJqWWYPBod3Hri\n/NQ1X0+ihQ5GTUHSFZfHI6lO9QdIQlcnC1Nlq82eVeI4eYDRl6B1CQSJ3aB2eSIW\nFtqwpMO53QKBgAZ/VjAZgcyut03denkCWAINzPaUhNmBWLD/BmUTWjF2HzERBNvh\nomaUVlpPAcl2MjY7e+KyuBAXRl6N8dkS6O146mLl9GIef9QY4e9sSocnwCU6/DKM\ni0GSDa2dWuWuCYSBNMf9yvqHs6POBvDro0XaiV3EJA9OAD6c5JejtsRZAoGACT+x\nej5zH4j3FHYrAHfsnUG388sZR48BCWBO5cj0buBMxLHB0IAqbI9FbWAB+w9V8vfj\n7alWhlYh1dQfvUou6Be5DG5CaQ6wp8qfb/UfXomwRtdFv3zchNxFJ8o4ENFqTCkU\nUJTF+zvq0/uplVkChtRpbRQyp7XdVOS+iRU1a9kCgYB+mNvM9WbSR9I7HU6aGkzi\n20ummxC3mLZ76FvnP1ERgswqHPqjnQe7jXCjhcG7GNe0abL8acS9vIQf2d1TN00h\nHWURgIYC/3NwnzTzhW7CCrDVa1xLw6AvsuVZtgBTrXebe5qz1kztQ5Ih0NVONqBr\n7oB2schPTAzxaUsRo2+pPg==\n-----END PRIVATE KEY-----\n",
    "client_email": "driveuploaderservice@upbeat-legacy-449513-q3.iam.gserviceaccount.com",
    "client_id": "116278889942557906886",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/driveuploaderservice%40upbeat-legacy-449513-q3.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};
const auth = new google.auth.GoogleAuth({
    credentials: KEYFILE_JSON,
    scopes: ['https://www.googleapis.com/auth/drive.file']
});
const drive = google.drive({ version: 'v3', auth });
const SECRET_KEY = 'passman';
adminRouter.post('/pdfspost', Authentication, upload.single('pdf'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const file = req.file;
    // If file size exceeds the limit, Multer will add an error object with `LIMIT_FILE_SIZE`
    console.log(body);
    console.log(file);
    if (!file) {
        return res.status(400).json({ msg: "No file uploaded!" });
    }
    if (file.mimetype != 'application/pdf') {
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
        // getting the link.and pasting to drive.
        //  convert buffer to stream
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);
        const fileMetadata = {
            name: req.file.originalname,
            parents: ['1B98QhgMK_4Nss0_Em4_M0jKYSt7VPVmW'],
        };
        const media = {
            mimeType: req.file.mimetype,
            body: bufferStream
        };
        // upload file to google drive
        const file = yield drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id"
        });
        // generate sharedable file link
        const fileid = file.data.id;
        drive.permissions.create({
            fileId: fileid,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });
        const fileLink = `https://drive.google.com/file/d/${fileid}/view`;
        const document = yield prisma.papers.create({
            data: {
                type: body.type,
                course: body.course,
                semester: Number(body.semester),
                pdf: fileLink,
                subject: body.subject,
                studentid: Number(body.studentid)
            }
        });
        //    Sending notifications to friends...
        const message_tosend = `A new file has been uploaded by user ${updated.name}`;
        let all = [];
        const youare_sender = yield prisma.friends.findMany({
            where: {
                sender: Number(body.studentid),
                status: true
            }
        });
        // taking friends where i am sender
        for (let i = 0; i < youare_sender.length; i++) {
            all.push(youare_sender[i].receiver);
        }
        const youare_receiver = yield prisma.friends.findMany({
            where: {
                receiver: Number(body.studentid),
                status: true
            }
        });
        // taking friends where i am receiver
        for (let i = 0; i < youare_receiver.length; i++) {
            all.push(youare_receiver[i].sender);
        }
        // Create notifications for all other users
        const notifications = all.map((user) => {
            return prisma.notifications.create({
                data: {
                    userId: Number(user),
                    contenttype: 'papers',
                    contentid: Number(document.id),
                    content: message_tosend,
                    giveid: Number(body.studentid)
                }
            });
        });
        // Wait for all notifications to be created
        yield Promise.all(notifications);
        return res.json({
            msg: "File uploaded..",
            totalcontributions: updated.contributions
        });
    }
    catch (err) {
        console.error("Error while..posting pdf!!->", err);
        return res.status(500).json({ msg: "An error occurred while uploading the file." });
    }
}));
adminRouter.get("/pdfdownload", Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
adminRouter.get("/findpdfs", Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parameters = req.query;
    if (!parameters.semester || !parameters.course) {
        return res.status(400).json({ msg: "Missing required parameters!" });
    }
    console.log(parameters);
    try {
        const Findall = yield prisma.papers.findMany({
            where: {
                semester: Number(parameters.semester),
                course: parameters.course
            }
        });
        console.log(Findall);
        if (Findall.length > 0) {
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
        return res.status(500).json({ msg: "Internal Server Error", error: err });
    }
}));
adminRouter.delete('/deleteall', Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.papers.deleteMany({});
        yield prisma.student.deleteMany({});
        res.json({ msg: "Allpapers and student  deleted!!" });
    }
    catch (err) {
        console.error(err);
    }
}));
adminRouter.post('/updatename', Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
adminRouter.get("/preview", Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const pdfid = req.query.id;
    if (!pdfid) {
        return res.json({ msg: "Pdfid is not there!" });
    }
    try {
        const paper = yield prisma.papers.findUnique({
            where: {
                id: Number(pdfid)
            }
        });
        console.log(paper);
        if (paper) {
            console.log(`PDF Buffer size: ${(_a = paper.pdf) === null || _a === void 0 ? void 0 : _a.length} bytes`);
            if (!paper.pdf) {
                return res.status(404).json({ msg: "PDF data is missing in the database!" });
            }
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="${paper.subject}.pdf"`);
            res.end(paper.pdf); // Explicitly end the response with the binary data  
        }
        else {
            res.status(404).json({
                msg: "No pdf is there!!"
            });
        }
    }
    catch (err) {
        console.log("Error while preview backend!!->", err);
        res.status(500).json({ msg: "An error occurred while fetching the PDF." });
    }
}));
adminRouter.get("/findpdflink", Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    if (!id) {
        return res.json({
            msg: "No id got!!"
        });
    }
    try {
        const pdf = yield prisma.papers.findUnique({
            where: {
                id: Number(id)
            }
        });
        console.log(pdf);
        return res.json({
            link: pdf === null || pdf === void 0 ? void 0 : pdf.pdf
        });
    }
    catch (err) {
        console.error(err);
    }
}));
adminRouter.get("/findnotelink", Authentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    if (!id) {
        return res.json({
            msg: "No id got!!"
        });
    }
    try {
        const pdf = yield prisma.notes.findUnique({
            where: {
                id: Number(id)
            }
        });
        console.log(pdf);
        return res.json({
            link: pdf === null || pdf === void 0 ? void 0 : pdf.pdf
        });
    }
    catch (err) {
        console.error(err);
    }
}));
adminRouter.put('/unfriend', Authentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        return res.json({
            msg: "Provide row id!!"
        });
    }
    try {
        const unfriend = yield prisma.friends.update({
            where: {
                id: Number(id)
            },
            data: {
                status: false
            }
        });
        return res.json({
            msg: "Unfriended!!"
        });
    }
    catch (err) {
        console.error(err);
    }
}));
// Notifications sending logic..
exports.default = adminRouter;
