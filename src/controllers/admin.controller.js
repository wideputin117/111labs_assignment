import { Company } from "../models/Company.js";
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";

export const add_company = asyncHandler(async(req, res, next)=>{
const {
  company_name,
  company_established,
  company_registration_no,
  company_website,
  company_address1,
  company_address2,
  city,
  state,
  zip_code,
  primary_contact_firstname,
  primary_contact_lastname,
  primary_contact_email,
  primary_contact_mobile
} = req.body;

if(!company_name || !company_established || !company_registration_no){
    return next(new ApiError("Invalid Data",400))
}
const data = await Company.create({
  company_name,
  company_established,
  company_registration_no,
  company_website,
  company_address1,
  company_address2,
  city,
  state,
  zip_code,
  primary_contact_firstname,
  primary_contact_lastname,
  primary_contact_email,
  primary_contact_mobile
})

if(!data){
    return next(new ApiError("Unable to create the company",402))
}
return res.status(201).json({message:"Company is created successfully", data:data, success:true})
})