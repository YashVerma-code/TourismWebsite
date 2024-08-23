const express=require("express")
const router=express.Router(); //return router object

const express=require("express");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const path=require("path");
const ejsMate=require("ejs-mate");
const app=express();
const port=8080;

const users=require("./routess/user.js");
const post=require("./routess/user.js");


app.use("/user",users) 
app.use("/post",post) ;