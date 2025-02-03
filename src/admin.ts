import Router from 'express'
import { PrismaClient } from '@prisma/client';
import {z} from 'zod'
import fs from  'fs'
import multer from 'multer'

import  jwt  from 'jsonwebtoken';
import { resolveMx } from 'dns';
const {google} = require("googleapis")
const dotenv = require("dotenv")
const stream = require("stream");

dotenv.config()
const adminRouter = Router();
const prisma  = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});


const SECRET_KEY :string = process.env.secret_key ?? 'passman'


function Authentication(req:any,res:any,next:any){
     let authheader = req.query.token || req.headers['authorization'];
  
    
    const token = authheader?.split(' ')[1];
  
    if(!token){
       return res.send({msg:"Access denied : No token provided"});
    }
    
    jwt.verify(token,SECRET_KEY,(err:any,user:any)=>{
      if(err){
          return res.send({msg:"Invalid token"})
      }
      next()
    })
    
  }
const upload = multer({
    storage: multer.memoryStorage()
    
});



// Parse the JSON string
const credentials ={
  "type": "service_account",
  "project_id": "upbeat-legacy-449513-q3",
  "private_key_id": "db1e1d0183529c69678faabb62a12416db9d88eb",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnrj5fQCaEkBVZ\n2xpnPm5nRsd13qE4AI6sRUfnFaFGKecZN38v9gVUmmF6NAwqsuaZeoDZwJ7JLWwD\ncPzoQ3QJWj8huUR4vl7uiOB0MX6yxCJayjw61Gm/Fwt58QsrRpNN4l0Xd/4YCueP\nLy7zn0WSrKxsKzhIkokKCE1cQWiodeJmg3xVs3BGl1hbDThbXl6X2h/iYiF6sl9V\n7dhTbAtfHbSwrg3/y1w8r4TLJpget6nOKWi5eglhJuGTRNMZa1YCHo2/n7fuB840\nlFOSqLvtabtwCBZFUly+0h40KEyUHgI2crecmEe8zxWg2vpUiU+9qnatS8h041RJ\nGOFkSZ8FAgMBAAECggEAAuAOthqTCnd0obYuZbRIpSTOZOVrwB4sUcb/qsaB8d+j\nQT+HEeP5Eku4L067YpbwdbHSLOGkbCq8JG7Kigy26/F1cchdfoIeUNIyDD8bq2xJ\nC4dm/UlAPAw1KuuVj+aYUrx0cKN0ln0hfTgWBRVSRQ0PjBLH6AlUL2OwUhdzDQ7O\nF0HpyTI+uMBPsx8z0fwTuS/CJh8z9ol/50KkKsprYT7NCwMvUmUcNFKEho3XsEki\nUXV4CZ804F8YiyUAQYONwAfa20fSmKZ9x8xX0sWS8ZqSgKaWtxlilNGQoX0Yd+co\nUl1W4O1UTW5xSE4WHY+zOEg1Wxr3TswmN9M7xFq0AQKBgQD5TCMa07hkL2gkmL8K\nbpbTr0gJXwcE9G+fOmaclXF37EUBnQhZG2qe3ZhfWGqvvTmH39MaRHnvLWFqU5UC\ndD3FUIXW/ATGKPjIKtKAShwK095piV3Du86FuNESRRi0ZaNne/ZXStX7smQlEU6t\nkNHQuFOnTurfeK9mWqYicODL4QKBgQDt6NqYw9wEbsfSJ19Mm2U4rLh8va86nOHg\nmk7CAZI717iA/BLtDPM5+5xVyvWJSOSNY+mPX2pVFtKbeYj5ZrTuaVPReb0vu3vK\n+6jDnU2e5JunVstBo4DK/6m34KsYtORKgvxnlGvgkzTJgXpU2WNQ3M+UaTBO1IE/\nxorLq7UXpQKBgQDNr3vnTnf8cQDD8SLuQIBA94W/9Z+c/vB5t32iA8sy3sWwpxeU\nLYKywLJPOGwNw1oMOSe7rHPOWurdB0kSVUYB3oYO8rAdrwBUZsB3CK5KYLRI7wVl\n0TZ8LhiRsmDHtnQzlZuSOjSDDpSB4N3BZpM2Wl7q07oF11UgZfpcwDU5AQKBgA83\ntcPPw2MFMwLeQdpEllTpt2NDPtIg9tHHDQKb1x68zbByb0N6cJRk47sZIFuHrhbd\nLTNehw6qRw5q17gcObaGRjY/8zn6ZBC3yDO6/BwNw2cQxi+MpdBWSiTY2hjaeT/K\n4Ro/BCd5QwcgoRKMVS328dAsakqgjSPnLzmX4h2BAoGAEpn9KAsWQS/r4HnYQmKZ\nUjGf4gutWfpJaOU7aupxGGIdJGYbAjKOoZ7MQdLjkFl/7VovW2Vn4T27nKpqXE23\nhoRN2Kk41xL/P5wpW4vyFUDhE5Y1asg5JQ6oB6oZdtgykRN+jmlipa/DXYoWx73x\nhdy9P+Ne3gyrvpdjDmMKPM8=\n-----END PRIVATE KEY-----\n",
  "client_email": "driveuploaderservice@upbeat-legacy-449513-q3.iam.gserviceaccount.com",
  "client_id": "116278889942557906886",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/driveuploaderservice%40upbeat-legacy-449513-q3.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}


const auth = new google.auth.GoogleAuth({
    credentials:(credentials) as any,
    scopes:['https://www.googleapis.com/auth/drive.file']
})

const drive = google.drive({version:'v3',auth});


adminRouter.post('/pdfspost',Authentication,upload.single('pdf'),async(req:any,res:any,next:any)=>{
   

   
    const body = req.body;
    const file = req.file;

      // If file size exceeds the limit, Multer will add an error object with `LIMIT_FILE_SIZE`
  
     console.log(body)
     console.log(file)
     


    if(!file){
        return res.status(400).json({ msg: "No file uploaded!" });
    }

    if (file.mimetype != 'application/pdf') {
      
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

        // getting the link.and pasting to drive.

    //  convert buffer to stream

    const bufferStream = new stream.PassThrough();  
    bufferStream.end(req.file.buffer)


     const fileMetadata = {
         name:req.file.originalname,
         parents:['1B98QhgMK_4Nss0_Em4_M0jKYSt7VPVmW'],
     }
 
     const media = {
         mimeType:req.file.mimetype,
         body:bufferStream
     }
 
 
     // upload file to google drive
           const driveResponse = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
 
   const fileId = driveResponse?.data?.id; // Ensure fileId exists

    if (!fileId) {
        return res.status(500).json({ msg: "Failed to upload file: No file ID returned from Google Drive" });
    }
    
    await drive.permissions.create({
        fileId: fileId, // Now it's guaranteed to be a string
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });
     const fileLink = `https://drive.google.com/file/d/${fileId}/view`

 
     const document =  await prisma.papers.create({
        data:{
            type:body.type,
            course:body.course,
            semester:Number(body.semester),
            pdf:fileLink,
            subject:body.subject,
            studentid:Number(body.studentid)
        }
       })



//    Sending notifications to friends...

    const message_tosend = `A new file has been uploaded by user ${updated.name}`
    
    let all = []

       const youare_sender = await prisma.friends.findMany({
        where:{
          sender:Number(body.studentid),
          status:true
        }
      })
// taking friends where i am sender
      for(let i=0;i<youare_sender.length;i++){
        all.push(youare_sender[i].receiver)
      }



      const youare_receiver = await prisma.friends.findMany({
        where:{
          receiver:Number(body.studentid),
          status:true
        }
      })
  // taking friends where i am receiver
      for(let i=0;i<youare_receiver.length;i++){
        all.push(youare_receiver[i].sender)
      }


    // Create notifications for all other users
    const notifications = all.map((user)=>{
      return  prisma.notifications.create({
            data:{
                userId:Number(user),
                contenttype:'papers',
                contentid:Number(document.id),
                content:message_tosend,
                giveid:Number(body.studentid)
            }
      })
    })
          // Wait for all notifications to be created

          await Promise.all(notifications) 
    
       

       return res.json({
        msg:"File uploaded..",
        totalcontributions:updated.contributions
       })
    }
    catch(err){
        console.error("Error while..posting pdf!!->",err)
        return res.status(500).json({ msg: "An error occurred while uploading the file." });
    }
})




adminRouter.get("/pdfdownload",Authentication,async(req:any,res:any,next:any)=>{
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
adminRouter.get("/findpdfs",Authentication,async(req:any,res:any,next:any)=>{
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
adminRouter.delete('/deleteall',Authentication,async(req:any,res:any,next:any)=>{
try{
    await prisma.papers.deleteMany({})
 

 await prisma.student.deleteMany({})
 
 res.json({msg:"Allpapers and student  deleted!!"})
}
catch(err){
    console.error(err)
}
})

adminRouter.post('/updatename',Authentication,async(req:any,res:any,next:any)=>{
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

adminRouter.get("/preview",Authentication,async(req:any,res:any,next:any)=>{
    const pdfid = req.query.id;

    if(!pdfid){
        return res.json({msg:"Pdfid is not there!"})
    }

    try{
        const paper = await prisma.papers.findUnique({
           where:{
            id:Number(pdfid)
           }
        })

        console.log(paper)
        if(paper){
            console.log(`PDF Buffer size: ${paper.pdf?.length} bytes`);
            if(!paper.pdf){
                return res.status(404).json({ msg: "PDF data is missing in the database!" });
            }

            res.setHeader("Content-Type","application/pdf");
            res.setHeader("Content-Disposition",`inline; filename="${paper.subject}.pdf"`)
           
            res.end(paper.pdf); // Explicitly end the response with the binary data  
        }
        else{
            res.status(404).json({
                msg:"No pdf is there!!"
            })
        }
    }
    catch(err){
        console.log("Error while preview backend!!->",err);
        res.status(500).json({msg:"An error occurred while fetching the PDF."})
    }
})
adminRouter.get("/findpdflink",Authentication,async(req:any,res:any,next:any)=>{
    const id = req.query.id;

    if(!id){
        return res.json({
            msg:"No id got!!"
        })
    }

    try{
        const pdf = await prisma.papers.findUnique({
            where:{
                id:Number(id)
            }
        })

        console.log(pdf)
        return res.json({
            link:pdf?.pdf
        })
    }
    catch(err){
        console.error(err)
    }
})
adminRouter.get("/findnotelink",Authentication,async(req:any,res:any,next:any)=>{
    const id = req.query.id;

    if(!id){
        return res.json({
            msg:"No id got!!"
        })
    }

    try{
        const pdf = await prisma.notes.findUnique({
            where:{
                id:Number(id)
            }
        })

        console.log(pdf)
        return res.json({
            link:pdf?.pdf
        })
    }
    catch(err){
        console.error(err)
    }
})
adminRouter.put('/unfriend',Authentication,async(req:any,res:any)=>{
    const {id} = req.body;

    if(!id){
        return res.json({
            msg:"Provide row id!!"
        })
    }

    try{
        const unfriend = await prisma.friends.update({
            where:{
              id:Number(id)
            },
            data:{
                 status:false
            }
        })

        return res.json({
            msg:"Unfriended!!"
        })
    }
    catch(err){
        console.error(err)
    }
})

// Notifications sending logic..


export default adminRouter
