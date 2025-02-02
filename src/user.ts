import { PrismaClient } from "@prisma/client";
import { Router ,Request,Response,NextFunction} from "express";

import jwt from 'jsonwebtoken';
const userRouter = Router();
import {array, z} from 'zod'
const SECRET_KEY = 'passman'

// Middleware

function Authentication(req:any,res:any,next:any){
  let authheader ;

  if(req.query.token){
    authheader = req.query.token
  }
  else authheader = req.headers['authorization']
  

  const token = authheader && authheader.split(' ')[1];

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
 const userSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    name:z.string(),
    description:z.string()
 })

 const prisma = new PrismaClient();
 interface userBody{
    email:string,
    password:string,
    name:string,
    description:string
 }

userRouter.post('/create',async (req:any,res:any,next:any)=>{
      const body:userBody = req.body;
 
      const response = userSchema.safeParse(body);
      
      if(!response.success){
        return res.json({
            msg:"Invalid schema type!!"
        })
      }

      
      try{
// finding ..
        const find = await prisma.student.findUnique({
            where:{
                email:body.email
             }
          })
    
          if(find){
            return res.json({
                msg:"User already exist with this Email!!"
            })
          }

        // creating
        await prisma.student.create({
            data:{
                email:body.email,
                password:body.password,
                name:body.name,
                description:body.description
            }
        })
        res.json({
            msg:"User created!!"
        })
      }
      catch(err){
        console.log("Error while creating..-> ",err)
      }

      
})

userRouter.post('/login',async(req:any,res:any,next:any)=>{
  const body = req.body;
  
  if(!body){
    return res.json({
      msg:"Data not got.."
    })
  }
  try{
    
    const find = await prisma.student.findUnique({
      where:{
        email:body.email,
        password:body.password
      }
    })
    if(!find){
      return res.json({
        msg:"Username or email not found!!,Signup first."
      })
    }
    
    //Generate JWT token
    const token = jwt.sign({id:find.id,email:find.email},SECRET_KEY)
    
    return res.json({
      msg:"User found!!",
      id:find.id,
      token:token
    })

  }
  catch(err){
    console.log("Error while login..-> ",err);
  }
})


userRouter.get("/getall",Authentication,async(req:any,res:any,next:any)=>{
    const studentid = req.query.studentid
   
    if(!studentid){
      return res.json({msg:"Didn't get studentid"})
    }
    try{
      const allpapers = await prisma.papers.findMany({ 
        where:{
          studentid:Number(studentid)
        }
       
      })
     if(allpapers){
      return res.json({
        length:allpapers.length,
        data:allpapers,
          
      })
     }
     else{
      return res.json({msg:"No document exists!!"})
     }
      
    }

   
    catch(err){
      console.error("Error in getall papers->",err);
      next(err)
    }

})

userRouter.delete('/delpdf',Authentication,async(req:any,res:any,next:any)=>{
     const docid = req.query.docid;

     if(!docid){
      return res.json({msg:"No id got!!"})
     }

     try{
        await prisma.papers.delete({
          where:{
            id:Number(docid)
          }
        })

        res.json({
          msg:"Document deleted!!"
        })
     }
     catch(err){
      console.error(err);
     }
})
userRouter.get("/reduceContri",Authentication,async(req:any,res:any,next:any)=>{
  const userid = req.query.userid;

  if(!userid){
    return res.json({msg:"Didn't get userid!!"})
  }
  try{
    const updated = await prisma.student.update({
      where:{
        id:Number(userid)
      },
      data:{
         contributions:{
          decrement:1
         }
      }
    })

    res.json({
      totalcontributions:updated.contributions
    })
  }
  catch(err){
    console.error("Error while reduceContr->i",err)
  }
})
userRouter.delete("/deleteuser",Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id;

  if(!id){
    return res.json({msg:"Id is not found!!"})
  }

  try{
    await prisma.student.delete({
      where:{
        id:Number(id)
      }
    })
  }
  catch(err){
    console.error("Error while delete user->",err)
    res.status(500).json({msg:"Error"})
  }
})


import multer from "multer";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";  
import stream from 'stream'
const upload = multer({
    storage: multer.memoryStorage()
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
}

const auth = new google.auth.GoogleAuth({
  credentials: KEYFILE_JSON,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

userRouter.post("/postnote",Authentication,upload.single('pdf'),async(req:any,res:any,next:any)=>{
    const body = req.body;
    const file = req.file

    console.log(body);
    console.log(file);

   
    if(!file){
      return res.json({
        msg:"No file found!!"
      })
    }

    if(file.mimetype != "application/pdf"){
      return res.json({
        msg:"Only pdfs are allowed to post!!"
      })
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

      // uploading to drive
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
   
       const file = await drive.files.create({
           requestBody:fileMetadata,
           media:media,
           fields:"id"
       })
  
       // generate sharedable file link
       const fileid = file.data.id
  
     
       const fileLink = `https://drive.google.com/file/d/${fileid}/view`
  

      const document =  await prisma.notes.create({
        data:{
            course:body.course,
            semester:Number(body.semester),
            pdf:fileLink,
            subject:body.subject,
            studentid:Number(body.studentid)
        }
       })




       const message_tosend =   `Latest notes are uploaded by user ${updated.name}`;

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

     

       

     
      const notifications =   all.map((each)=>{
          return prisma.notifications.create({
            data:{
              userId:Number(each),
              contentid:Number(document.id),
              contenttype:'notes',
              content:message_tosend,
              giveid:Number(body.studentid)
            }
          })
        })
        
        await Promise.all(notifications)

       return res.json({
        msg:"File uploaded..",
        totalcontributions:updated.contributions
       })


    }
    catch(err){
      console.error("Error while posting notes ->",err);
      return res.status(500).json({
        msg:"Error while posting!!"
      })
    }



})

userRouter.get('/downloadnote',Authentication,async(req:any,res:any,next:any)=>{
  const pdfid = req.query.pdfid

  if(!pdfid){
    return res.json({
      msg:"Not found pdfid"
    })
  }

  try{
    const note = await prisma.notes.findUnique({
      where:{
        id:Number(pdfid)
      }
    })

    console.log(note)
    

    if(note){
      const pdfbuffer = Buffer.from(note.pdf)
      res.setHeader('Content-Disposition', `attachment; filename="notes-${note.subject + note.id}.pdf"`)
      res.setHeader('Content-Type', 'application/pdf');

      res.send(pdfbuffer)
    }
    else{
      return res.json({
        msg:"No notes are found!!"
      })
    }

  }
  catch(err){
    console.error("Error while downloading note->",err)
    return res.status(500).json({msg:"Error0"})
  }
})

userRouter.get('/previewnote',Authentication,async(req:any,res:any,next:any)=>{
    const id = req.query.id

    if(!id){
      return res.json({msg:"No id found!!"})
    }

    try{
      const particular = await prisma.notes.findUnique({
        where:{
          id:Number(id)
        }
      })

      if(particular){
        console.log(`PDF Buffer size: ${particular.pdf?.length} bytes`);

        if(!particular.pdf){
          
          return res.json({
            msg:"No note is found!!"
          })
        }
        else{
          res.setHeader("Content-Type","application/pdf");
          res.setHeader("Content-Disposition",`inline; filename="${particular.subject}.pdf"`)
         
          res.end(particular.pdf); // Explicitly end the response with the binary data  
        }
      }
      else{
        res.status(404).json({
            msg:"No pdf is there!!"
        })
    }
    }
    catch(err){
      console.error("Error while previewing notes ->",err);
    }
})
userRouter.get('/findnotes',Authentication,async(req:any,res:any,next:any)=>{
     const body = req.query;
     console.log(body)
     try{
        const allnotes = await prisma.notes.findMany({
          where:{
            semester:Number(body.semester),
            course:body.course
          }
        })

        console.log(allnotes)

        if(allnotes){
          return res.json({
            msg:"Found notes",
            notes:allnotes
          })
        }
        else{
          res.json({
            msg:"Not note found!!"
          })
        }
     }
     catch(err){
      console.error("Error while find notes->",err);
     }
})

userRouter.get('/yournotes',Authentication,async(req:any,res:any,next:any)=>{
   const studentid = req.query.id;

   if(!studentid){
      return res.json({
        msg:"No id got!!"
      })
   }

   try{
    const all = await prisma.notes.findMany({
      where:{
        studentid:Number(studentid)
      }
    })
    console.log(all)
    if(all){
      return res.json({
        msg:"Found notes!!",
        length:all.length,
        all:all
      })
    }
    else{
      res.json({
        msg:"No notes found!!"
      })
    }
   }
   catch(err){
    console.error("Error while getting notes->",err)
   }
})

userRouter.delete('/deletenotes',Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id;

  if(!id){
    return res.json({
      msg:"No id got!!"
    })
  }

  try{
    await prisma.notes.delete({
      where:{
        id:Number(id)
      }
    })
    return res.json({
      msg:"Notes deleted!!"
    })
  }
  catch(err){
    console.error("Error while deleting",err)
  }
})
userRouter.get("/reduceContrinew",Authentication,async(req:any,res:any,next:any)=>{
  const userid = req.query.userid;

  if(!userid){
    return res.json({msg:"Didn't get userid!!"})
  }
  try{
    const updated = await prisma.student.update({
      where:{
        id:Number(userid)
      },
      data:{
         contributions:{
          decrement:1
         }
      }
    })

    res.json({
      totalcontributions:updated.contributions
    })
  }
  catch(err){
    console.error("Error while reduceContri->",err)
  }
})
userRouter.delete("/alldeletenotes",Authentication,async(req:any,res:any,next:any)=>{
  try{
    await prisma.notes.deleteMany({})

    return res.json({
      msg:"All deleted!!"
    })
  }
  catch(err){
    console.error(err)
  }
})
userRouter.delete('/alldeletepapers',Authentication,async(req:any,res:any,next:any)=>{
  try{
    await prisma.papers.deleteMany({})
    return res.json({
      msg:"All deleted!!"
    })
  }
  catch(err){
    console.error(err)
  }
})


// Notifications Request...

userRouter.get("/getNotifications",Authentication,async(req:any,res:any,next:any)=>{
  const userid = req.query.userid;

  if(!userid){
    return res.json({msg:"User id not found!!"})
  }
  try{
     
    const all = await prisma.notifications.findMany({
      where:{
        userId:Number(userid),
      }
    })

    const updateall = await Promise.all(
      all.map(async(each:any)=>{
        const user = await prisma.student.findUnique({
          where:{
            id:Number(each.giveid)
          },
          select:{profileimg:true}
  
      })
  
        // const base64front = user?.profileimg
        //   ? `data:image/png;base64,${Buffer.from(user.profileimg).toString('base64')}`
        //   : null;
        console.log(user?.profileimg)
           const profileimg = user?.profileimg
          return {
            ...each,
            profileimg:profileimg
          }
  
        })
      )

     console.log(all)
    if(all){
       res.json({
        msg:"got all",
        all:updateall
       })
    }
    else{
      res.json({
        msg:"No notify found!!"
      })
    }
  }
  catch(err){
    console.error("Error while getting notify->",err)
    return res.status(500).json({
      msg:"Catch error"
    })
  }
})
userRouter.get("/getNotificationsall",Authentication,async(req:any,res:any,next:any)=>{
  
  try{
     
    const all = await prisma.notifications.findMany({})
    console.log(all)
    if(all){
       res.json({
        msg:"got all",
        all:all
       })
    }
    else{
      res.json({
        msg:"No notify found!!"
      })
    }
  }
  catch(err){
    console.error("Error while getting notify->",err)
    return res.status(500).json({
      msg:"Catch error"
    })
  }
})

// Count notify that is unseen

userRouter.get('/countnotify',Authentication,async(req:any,res:any,next:any)=>{
  const userid = req.query.userid

  if(!userid){
    return res.json({
      msg:"No id found!!"
    })
  }

  try{
    const number = await prisma.notifications.count({
      where:{
        userId:Number(userid),
        seen:false
      }
    })
    if(number){
      return res.json({
        count:number
      })
    }
    else{
      res.json({
        msg:"No notification found!!"
      })
    }
  }
  catch(err){
    console.error("Error while counting->",err)

  }
})


userRouter.get('/getprofile',Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id ;
  if(!id){
    return res.json({
      msg:"Id not found!!"
    })
  }
  
  try{
    let profile = await prisma.student.findUnique({
      where:{
        id:Number(id)
      }
    })
    // const base64front = profile?.profileimg
    // ? `data:image/png;base64,${Buffer.from(profile.profileimg).toString('base64')}`
    // : null;
    
    // const newprofile = {
    //   ...profile,
    //   profileimg:base64front
    // }
    console.log(profile)
    if(profile){
      return res.json({
        profile:profile
      })
    }
  }
  catch(err){
    console.error(err)
  }
})
userRouter.get('/getpaper',Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id ;
  if(!id){
    return res.json({
      msg:"Id not found!!"
    })
  }

  try{
    const content = await prisma.papers.findUnique({
      where:{
        id:Number(id)
      }
    })
    console.log(content)
    if(content){
      return res.json({
        content:content
      })
    }
  }
  catch(err){
    console.error(err)
  }
})
userRouter.get('/getnote',Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id ;
  if(!id){
    return res.json({
      msg:"Id not found!!"
    })
  }

  try{
    const content = await prisma.notes.findUnique({
      where:{
        id:Number(id)
      }
    })
    console.log(content)
    if(content){
      return res.json({
        content:content
      })
    }
  }
  catch(err){
    console.error(err)
  }
})

userRouter.put('/changeseen',Authentication,async(req:any,res:any,next:any)=>{
      const id = req.query.id ;
      if(!id){
        return res.json({
          msg:"Id not found!!"
        })
      }

      try{
        const updated = await prisma.notifications.update({
          where:{
            id:Number(id)
          },
          data:{
            seen:true
          }
        })
        console.log(updated);
        return res.json({
          msg:"You have seen this post!"
        })
      }
      catch(err){
        console.error(err)
      }
})
userRouter.delete('/deletenotification',Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id;

  if(!id){
    return res.json({
      msg:"Id not found!!"
    })
  }

  try{
     await prisma.notifications.delete({
      where:{
        id:Number(id)
      }
     })

     return res.json({
      msg:"Notification Deleted"
     })
  }
  catch(err){
    console.error(err)
  }
})


// Friends Requests ..

userRouter.get("/getpeople",Authentication,async(req:any,res:any,next:any)=>{
  const {userid} = req.query;

  if(!userid){
    return res.json({
      msg:"No userid found!!"
    })
  }

  try{
    // finding all users .

    const allusers = await prisma.student.findMany({})
   console.log(allusers.length)
     const nonfriends = []

     for(const user of allusers){
      if(user.id === Number(userid)) continue;
      const ifexist = await prisma.friends.findMany({
        where:{
          OR:[
            {sender:Number(userid),receiver:Number(user.id)},
            {sender:Number(user.id),receiver:Number(userid)}
          ]

        }
      })
      if(ifexist.length === 0){
        // const base64front = user?.profileimg
        // ? `data:image/png;base64,${Buffer.from(user.profileimg).toString('base64')}`
        // : null;
        // const base64back = user?.backimg
        // ? `data:image/png;base64,${Buffer.from(user.backimg).toString('base64')}`
        // : null;

        nonfriends.push(user)
      }
  
     }


     return res.json({
      nonfriends:nonfriends
     })
      
  }
  catch(err){
    console.error('Error while getting non-friends->',err);
    return res.status(500).json({
      msg:"Error while getting non-friends"
    })
  }
})

userRouter.post('/sendreq',Authentication,async(req:any,res:any,next:any)=>{
    const body = req.body;

    console.log(body);

    try{

      // Checking for any duplicate request is there..

      const existing = await prisma.friends.findFirst({
        where:{
          OR:[
            {sender:Number(body.sender),receiver:Number(body.receiver)},
            {sender:Number(body.receiver),receiver:Number(body.sender)}
          ]
        }
      })

      if(existing){
        return res.json({
          msg:"Request already exists!!"
        })
      }


// if no request pending..
      const sending = await prisma.friends.create({
        data:{
           sender :Number(body.sender),
           receiver:Number(body.receiver),
           status:false  
        }
      })

      console.log(sending)
      return res.json({
        msg:"Request sent!!",
        id:sending.id
      })
    }
    catch(err){
      console.error("Error while sending request!!->",err)
    }
})

userRouter.get('/getfriends',Authentication,async(req:any,res:any,next:any)=>{
  const userid = req.query.userid;

  if(!userid){
    return res.json({
      msg:"No userid got!!"
    })
  }

  try{
    // Either you were sender or receiver
    const friends = await prisma.friends.findMany({
      where:{
         OR:[
          {sender:Number(userid),status:true},
          {receiver:Number(userid),status:true}
         ]
      }
    })

    console.log(friends);

    if(friends){
      return res.json({
        friends:friends
      })
    }
    else{
      res.json({
        msg:"No friends"
      })
    }
  }
  catch(err){
    console.log("error while getting friends->",err)
  }
})

userRouter.get('/getpending',Authentication,async(req:any,res:any,next:any)=>{
   const userid = req.query.userid;

   if(!userid){
    return res.json({
      msg:"No userid found!!"
    })
   }

   try{
    const pendings = await prisma.friends.findMany({
      where:{
        receiver:Number(userid),
        status:false
      }
    })

   

    

    let obj:Record<number,any> = {};
    
    const results = await Promise.all(
      pendings.map((async(each:any)=>{
        const eachuser = await prisma.student.findUnique({
          where:
          {
            id:Number(each.sender)
          }
        })

    
        // const base64 = eachuser?.profileimg
        // ? `data:image/png;base64,${Buffer.from(eachuser.profileimg).toString('base64')}`
        // : null;



       
      
        return {
          id:each.id,
          user:eachuser
        }
      })
    )
  )

  results.forEach((result)=>{
    obj[result.id]=result.user
  })


    console.log(obj)

    return res.json({
      obj:obj,
    
    })
   }
   catch(err){
    console.error("Error while getting pendings->",err)
   }
})

userRouter.get('/counting',Authentication,async(req:any,res:any,next:any)=>{
   const id = req.query.id;
   if(!id){
    return res.json({
      msg:"No id found!!"
    })
   }

   try{
    const count = await prisma.friends.count({
      where:{
        receiver:Number(id),
        status:false
      }
    })

    return res.json({
      count:count
    })
   }
   catch(err){
    console.error(err);
    return res.status(500).json({
      msg:"Error"
    })
   }
})
userRouter.put('/acceptreq',Authentication,async(req:any,res:any,next:any)=>{
  const {rowid} = req.query

  console.log(req.query);

  try{
    const accepted = await prisma.friends.update({
      where:{
       id:Number(rowid),
       
      },
      data:{
        status:true
      }
    })
    console.log(accepted)
    
    return res.json({
      msg:"Request accepted!!"
    })
  }
  catch(err){
    console.error('Error while accepting',err);
   return  res.status(500).json({
      msg: "Failed to accept the request. Please try again later.",
    });
  }
})

userRouter.delete('/declinereq',Authentication,async(req:any,res:any,next:any)=>{
  const {rowid} = req.query

  console.log(req.query)

  try{
    await prisma.friends.delete({
      where:{
        id:Number(rowid)
      }
    })

    return res.json({
      msg:"Request declined!!"
    })
  }
  catch(err){
    console.error(err);
    return res.status(500).json({
      msg: "Failed to decline the request. Please try again later.",
    });
  }
})

userRouter.post('/sendnotification',Authentication,async(req:any,res:any,next:any)=>{
      const {giveid,userid} = req.body;
      console.log(req.body)
      
      
    

      try{

        // finding user
        const user = await prisma.student.findUnique({
          where:{
            id:Number(giveid)
          }
        })

        const content = `${user?.name} has accepted your friend request `
        const created = await prisma.notifications.create({
          data:{
            giveid:Number(giveid),
            userId:Number(userid),
            content:content,
            contenttype:'req',
            contentid:0
          }
        })

        if(created){
          return res.json({
            msg:"Notification created"
          })
        }
      }
      catch(err){
        console.error(err)
      }
      
})
userRouter.post('/createfeedback',Authentication,async(req:any,res:any,next:any)=>{
    const body = req.body;

    console.log(body);

    try{
      const create = await  prisma.feedback.create({
        data:{
          feedby:Number(body.feedby),
          type:body.type,
          feedback:body.feedback
        }
      })
      console.log("Feedback is ->",create)
      
      return res.json({
        msg:"Feedback submitted"
      })

    }
    catch(err){
      console.error("Error while creating feedback->",err)
    }
})




// Images route

userRouter.post('/backimage',Authentication,upload.single('file'),async(req:any,res:any,next:any)=>{
  const {id} = req.body


  if(!id || !req.file){
    return res.json({
      msg:"Please give id and file "
    })
  }
 
  try{
    const fileMetadata = {
      name: req.file.originalname,
      parents: ["1B98QhgMK_4Nss0_Em4_M0jKYSt7VPVmW"], // Replace with actual Google Drive folder ID
  };

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  const media = {
      mimeType: req.file.mimetype,
      body: bufferStream,
  };

  // Upload file to Google Drive
  const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
  });

  // Get the file ID
  const fileId = file.data.id;
  // Generate shareable file link
  const fileLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    const updating = await prisma.student.update({
      where:{
        id:Number(id)
      },
      data:{
        backimg:fileLink
      }
    })
    
    res.status(200).send({msg:"Background updated successfully"})
  }
  catch(err){
    console.error("Error updating background:", err);
    res.status(500).send({
      msg: "An error occurred while updating the background",
      error: err,
    });
  }
})
userRouter.post('/profileimage',Authentication,upload.single("file"),async(req:any,res:any,next:any)=>{
  const {id} = req.body
  
  if(!id || !req.file){
    return res.json({
      msg:"Please give id and file"
    })
  }

  try{
    const fileMetadata = {
      name: req.file.originalname,
      parents: ["1B98QhgMK_4Nss0_Em4_M0jKYSt7VPVmW"], // Replace with actual Google Drive folder ID
  };

  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);

  const media = {
      mimeType: req.file.mimetype,
      body: bufferStream,
  };

  // Upload file to Google Drive
  const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
  });

  // Get the file ID
  const fileId = file.data.id;
  // Generate shareable file link
  const fileLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    
   
    const updating = await prisma.student.update({
      where:{
        id:Number(id)
      },
      data:{
        profileimg:fileLink
      }
    })
    
    res.status(200).send({msg:"Profile updated successfully"})
  }
  catch(err){
    console.error("Error updating background:", err);
    res.status(500).send({
      msg: "An error occurred while updating the background",
      error: err,
    });
  }
})
userRouter.get('/getimage',Authentication,async(req:any,res:any,next:any)=>{
  const id = req.query.id;
  if(!id){
    return res.json({
      msg:"No id found!!"
    })
  } 

  try{
    const user = await prisma.student.findUnique({
      where:{
        id:Number(id)
      },
      select:{backimg:true,profileimg:true}
    })
    if(!user){
      return res.status(404).json({message:"No user found"})
    }
    
    

    
      
  // const base64imageback = user.backimg ? `data:image/png;base64,${Buffer.from(user.backimg).toString('base64')}}`:null;
  // const base64imagefront = user.profileimg ? `data:image/png;base64,${Buffer.from(user.profileimg).toString('base64')}`:null;
  
  // console.log(base64imageback?.slice(0,10))
  // console.log(base64imagefront?.slice(0,10))
  res.json({ back: user.backimg, front: user.profileimg });
  }
  catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

 
})
userRouter.get('/getfeed',async(req:any,res:any,next:any)=>{
  const type = req.query.type;

  if(!type){
    return res.json({
      msg:"No input got!!"
    })
  }

  try{
    const feeds = await prisma.feedback.findMany({
      where:{
        type:type
      }
    })

    const newfeeds = await Promise.all(
      feeds.map(async(each:any)=>{
        const eachstudent = await prisma.student.findUnique({
          where:{
            id:Number(each.feedby)
          },
          select:{
            profileimg:true,
            name:true
          }
        })

        return {
          ...each,
          image:eachstudent?.profileimg || null,
          name:eachstudent?.name || "Unknown"
        }
      })
    )

    console.log(newfeeds)
    return res.json({
      feeds:newfeeds
    })
  }
  catch(err){
    console.error(err)
  }
})

userRouter.get('/userinfo',async(req:any,res:any,next:any)=>{
  const id = req.query.id;
  if(!id){
    return res.json({
      msg:"No id got!!"
    })
  }

  try{
    const userinfo = await prisma.student.findUnique({
      where:{
        id:Number(id)
      },
      select:{
        contributions:true,name:true,description:true
      }
    })

    console.log(userinfo);

    if(userinfo){
      return res.json({
        userinfo:userinfo
      })
    }
    else return res.json({
      msg:"No user found!!"
    })
  }
  catch(err){
    console.error(err)
  }
})

userRouter.get('/takefriends',async(req:any,res:any,next:any)=>{
  const id = req.query.id;
  if(!id){
    return res.json({
      msg:"No id got!!"
    })
  }

  try{
     let all = []
 

     const iam_sender = await prisma.friends.findMany({
      where:{
        sender:Number(id),
        status:true
      }
     })

     const senderfriends = await Promise.all(
      iam_sender.map(async(each:any)=>{
        const user = await prisma.student.findUnique({
         where:{
           id:Number(each.receiver)
         }
        })

        // const base64imageback = user?.backimg ? `data:image/png;base64,${Buffer.from(user.backimg).toString('base64')}}`:null;
        // const base64imagefront = user?.profileimg ? `data:image/png;base64,${Buffer.from(user.profileimg).toString('base64')}}`:null;
      
       
 
        return {id:each.id,user:user}
 
 
      })
     )

     

     const iam_receiver = await prisma.friends.findMany({
      where:{
        receiver:Number(id),
        status:true
      }
     })

     const receiverfriends = await Promise.all(
      iam_receiver.map(async(each:any)=>{
        const user = await prisma.student.findUnique({
          where:{
            id:Number(each.sender)
          }
         })
  
        //  const base64imageback = user?.backimg ? `data:image/png;base64,${Buffer.from(user.backimg).toString('base64')}}`:null;
        //  const base64imagefront = user?.profileimg ? `data:image/png;base64,${Buffer.from(user.profileimg).toString('base64')}}`:null;
       
       
  
         return {id:each.id,user:user}
  
        
  
       })
  
     )
      all = [...receiverfriends,...senderfriends]


      let obj:Record<number,any>  = {};


     all.forEach((each:any)=>{
       obj[each.id]=each.user
     })

     return res.json({
      msg:"Friends retrieved successfully!.",
      friends:obj
     })



  }
  catch(err){
    console.error(err);
    return res.status(500).json({
      msg: "An error occurred while retrieving friends.",
      error: err,

    })
  }
})

export default userRouter 

