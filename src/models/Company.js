import mongoose from "mongoose";

const company_schema  =  new mongoose.Schema({
    company_name:{type:String, required:true ,unique:true, index:true },
    company_established:{type: Number, required:true, index:1},
    company_registration_no:{ type:Number, required:true, unique:true,index:1},
    company_website:{type:String},
    company_address1:{type: String},
    company_address2:{type: String},
    city:{ type:String, index:true},
    state:{type:String, index: true},
    zip_code:{type:Number},
    primary_contact_firstname:{ type:String},
    primary_contact_lastname:{ type:String},
    primary_contact_email:{ type:String, index:true},
    primary_contact_mobile:{ type:String, index:true},
},
{timestamps: true}
)


company_schema.index({
  company_name: 'text',
  company_address1: 'text',
  company_address2: 'text',
  city: 'text',
  state: 'text',
  primary_contact_firstname: 'text',
  primary_contact_lastname: 'text',
  zip_code: 'text'
});

export const Company = mongoose.model('Company',company_schema)