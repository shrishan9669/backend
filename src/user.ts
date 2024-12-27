import { PrismaClient } from "@prisma/client";
import { Router ,Request,Response,NextFunction} from "express";

const userRouter = Router();
import {z} from 'zod'

 const userSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    name:z.string()
 })

 const prisma = new PrismaClient();
 interface userBody{
    email:string,
    password:string,
    name:string
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
                name:body.name
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

    return res.json({
      msg:"User found!!",
      id:find.id
    })

  }
  catch(err){
    console.log("Error while login..-> ",err);
  }
})


userRouter.get("/getall",async(req:any,res:any,next:any)=>{
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
      res.json({msg:"No document exists!!"})
     }
      
    }

   
    catch(err){
      console.error("Error in getall papers->",err);
    }

})

userRouter.delete('/delpdf',async(req:any,res:any,next:any)=>{
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
userRouter.get("/reduceContri",async(req:any,res:any,next:any)=>{
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
export default userRouter

