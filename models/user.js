const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

// passport-local-mongooswe bydefault add a username and password -- with hash and salt field to store the username and password

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },

})

// this line automatically add username , password with hashing and salting.
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);



