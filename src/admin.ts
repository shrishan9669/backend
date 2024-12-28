import Router from 'express'




import { PrismaClient } from '@prisma/client';
import {z} from 'zod'
import fs from  'fs'

const adminRouter = Router();
const prisma  = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});



import path from 'path'
import multer from 'multer'

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, ''); // Directory where files will be stored
        },
        filename: (req, file, cb) => {
            // Set a placeholder for the file name. We'll update this after creating the document
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});

adminRouter.post('/pdfspost',upload.single('pdf'),async(req:any,res:any,next:any)=>{
    const body = req.body;
    const file = req.file
     console.log(body)
     console.log(file)


    if(!file){
        return res.status(400).json({ msg: "No file uploaded!" });
    }

    if (file.mimetype != 'application/pdf') {
        fs.unlinkSync(file.path); // Delete the file if it's not a PDF
        return res.status(400).json({ msg: "Uploaded file is not a PDF!" });
    }

    try{
       
     
        const updated = await prisma.student.update({
            where:{
                id:Number(body.studentid)
            },
            data:{
                contributions:{
                    increment:1
                }
            }
        })

       const document =  await prisma.papers.create({
        data:{
            type:body.type,
            course:body.course,
            semester:Number(body.semester),
            pdf:Buffer.from([]),
            subject:body.subject,
            studentid:Number(body.studentid)
        }
       })

       const paperId = document.id

       const newFileName = body.customName + paperId + '.pdf'

       const newFilePath = `${newFileName}`;
       fs.renameSync(file.path,newFilePath);

       const pdfBuffer = fs.readFileSync(newFilePath)

       await prisma.papers.update({
        where:{id:paperId},
        data:{pdf:pdfBuffer}
       })
       
       
       return res.json({
        msg:"File uploaded..",
        totalcontributions:updated.contributions
       })
    }
    catch(err){
        console.error("Error while..posting pdf!!->",err)
    }
})

adminRouter.get("/pdfdownload",async(req:any,res:any,next:any)=>{
     const pdfid :number= req.query.pdfid;

     try{
        const document = await prisma.papers.findUnique({
            where:{
                id:Number(pdfid)
            }
        })


        console.log(document);

        
        if(document){
            const pdfbuffer = Buffer.from(document.pdf);
           res.setHeader('Content-Disposition', `attachment; filename="${document.subject}.pdf"`)
           res.setHeader('Content-Type', 'application/pdf');

           res.send(pdfbuffer)
        }
        else{
            return res.json({
                msg:"Document not found!!"
            })
        }
     }
     catch(err){
        console.error("Error while downloading..pdf->",err)
     }




})
adminRouter.get("/findpdfs",async(req:any,res:any,next:any)=>{
    const parameters = req.query;
    if (!parameters.semester || !parameters.course) {
        return res.status(400).json({ msg: "Missing required parameters!" });
    }

    console.log(parameters)
    try{
        const Findall = await prisma.papers.findMany({
            where:{
                semester:Number(parameters.semester),
                
                course:parameters.course

            }
        })
        console.log(Findall)
        if(Findall.length > 0){
            return res.json({
                msg:"Found pdfs!!",
                all:Findall
            })
        }
        else{
            return res.json({
                msg:"No document exist..",
                all:[]
            })
        }
    }
    catch(err){
        console.error("Error while getting all pdfs!!->",err)
        return res.status(500).json({ msg: "Internal Server Error", error: err });
    }
})
adminRouter.delete('/deleteall',async(req:any,res:any,next:any)=>{
try{
    await prisma.papers.deleteMany({})
 

 await prisma.student.deleteMany({})
 
 res.json({msg:"Allpapers and student  deleted!!"})
}
catch(err){
    console.error(err)
}
})

adminRouter.post('/updatename',async(req:any,res:any,next:any)=>{
      const id = req.query.id;
      const name = req.query.name
      try{
       const New =  await prisma.student.update({
            where:{
                id:Number(id)
            },
            data:{
                name:name
            }
        })

        res.json({
            newname:New.name
        })
      }
      catch(err){
        console.error(err)
      }
})


export default adminRouter
