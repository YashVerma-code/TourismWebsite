const express=require("express")
const router=express.Router({mergeParams:true}); 


router.get("/posts",(req,res)=>{
    res.send("Hello")
})

router.post("/posts",(req,res)=>{
    res.send("Hello")
})

router.put("/posts",(req,res)=>{
    res.send("Hello")
})

router.get("/posts/:id",(req,res)=>{
    res.send("Hello")
})


router.get("/posts/:id/review",(req,res)=>{
    res.send("Hello")
})