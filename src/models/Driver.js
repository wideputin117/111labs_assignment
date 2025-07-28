import mongoose from "mongoose";

const driver_schema= new mongoose.Schema({
    first_name:{ type: String, required:true, index:true},
    last_name:{ type: String, required:true, index:true},
    email:{ type: String, required:true, unique:true,index:true},
    mobile:{ type: String, required:true, unique:true,index:true},
    license:{ type:String, required:true, unique:true},
    experience:{type:Number},
    address1:{ type: String, required:true},
    address2:{ type: String},
    city:{ type:String, index:true},
    state:{type:String, index:true},
    zipcode:{ type: String, index:true}
},{
    timestamps: true
})

driver_schema.index({
    first_name:'text',
    last_name:'text',
    email:'text',
    mobile:'text',
    address1:'text',
    city:'text',
    state:'text',
    zipcode:'text'
});


export const Driver= mongoose.model("Driver", driver_schema)