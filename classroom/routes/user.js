const express=require("express")
const router=express.Router(); 


router.get("/user",(req,res)=>{
    res.send("Hello")
})

router.post("/user",(req,res)=>{
    res.send("Hello")
})

router.put("/user",(req,res)=>{
    res.send("Hello")
})

router.get("/user/:id",(req,res)=>{
    res.send("Hello")
})


router.get("/user/:id/review",(req,res)=>{
    res.send("Hello")
})

module.exports=router