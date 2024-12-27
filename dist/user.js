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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
const zod_1 = require("zod");
const userSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string()
});
const prisma = new client_1.PrismaClient();
userRouter.post('/create', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const response = userSchema.safeParse(body);
    if (!response.success) {
        return res.json({
            msg: "Invalid schema type!!"
        });
    }
    try {
        // finding ..
        const find = yield prisma.student.findUnique({
            where: {
                email: body.email
            }
        });
        if (find) {
            return res.json({
                msg: "User already exist with this Email!!"
            });
        }
        // creating
        yield prisma.student.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name
            }
        });
        res.json({
            msg: "User created!!"
        });
    }
    catch (err) {
        console.log("Error while creating..-> ", err);
    }
}));
userRouter.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (!body) {
        return res.json({
            msg: "Data not got.."
        });
    }
    try {
        const find = yield prisma.student.findUnique({
            where: {
                email: body.email,
                password: body.password
            }
        });
        if (!find) {
            return res.json({
                msg: "Username or email not found!!,Signup first."
            });
        }
        return res.json({
            msg: "User found!!",
            id: find.id
        });
    }
    catch (err) {
        console.log("Error while login..-> ", err);
    }
}));
userRouter.get("/getall", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const studentid = req.query.studentid;
    if (!studentid) {
        return res.json({ msg: "Didn't get studentid" });
    }
    try {
        const allpapers = yield prisma.papers.findMany({
            where: {
                studentid: Number(studentid)
            }
        });
        if (allpapers) {
            return res.json({
                length: allpapers.length,
                data: allpapers,
            });
        }
        else {
            res.json({ msg: "No document exists!!" });
        }
    }
    catch (err) {
        console.error("Error in getall papers->", err);
    }
}));
userRouter.delete('/delpdf', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const docid = req.query.docid;
    if (!docid) {
        return res.json({ msg: "No id got!!" });
    }
    try {
        yield prisma.papers.delete({
            where: {
                id: Number(docid)
            }
        });
        res.json({
            msg: "Document deleted!!"
        });
    }
    catch (err) {
        console.error(err);
    }
}));
userRouter.get("/reduceContri", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.query.userid;
    if (!userid) {
        return res.json({ msg: "Didn't get userid!!" });
    }
    try {
        const updated = yield prisma.student.update({
            where: {
                id: Number(userid)
            },
            data: {
                contributions: {
                    decrement: 1
                }
            }
        });
        res.json({
            totalcontributions: updated.contributions
        });
    }
    catch (err) {
        console.error("Error while reduceContr->i", err);
    }
}));
exports.default = userRouter;
