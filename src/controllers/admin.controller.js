import { Company } from "../models/Company.js";
import { Driver } from "../models/Driver.js";
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import { applyPagination } from "../utils/pagination.js";

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

export const get_companies= asyncHandler(async(req, res, next)=>{
    const search = req.query.search || ""
    const {page, limit, skip} = applyPagination(req.query)
    
    const regex = new RegExp(search, "i")
    const query = search ? {
        $or: [
          { company_name: regex },
          { company_address1: regex },
          { company_address2: regex },
          { city: regex },
          { state: regex },
          { primary_contact_firstname: regex },
          { primary_contact_lastname: regex },
        ],
      } : {}; 

    const [data,total] = await Promise.all([Company.find(query).skip(skip).limit(limit).sort({ createdAt : -1 }), Company.countDocuments(query)])
    
    const pagination ={
        total:total,
        totalPages:Math.ceil(total/limit),
        page:page,
        limit:limit
    }
    
    return res.status(200).json({message:"Companies are recieved", data:data,paginate:pagination ,success:true})
})


export const update_company_detail = asyncHandler(async(req,res,next)=>{
    const company_id = req.params.companyId
  console.log("the company id is", company_id)
    if(!company_id){
        return next(new ApiError('Invalid company id',400))
    }
    const updates = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) =>
      value !== undefined && value !== null && value !== ""
    )
  );

  const updatedCompany = await Company.findByIdAndUpdate(
    company_id,
    { $set: updates },
    { new: true, runValidators: true }
  );
 
  if(!updatedCompany){
        return next(new ApiError('Company not found', 404));
  }
  return res.status(200).json({
    success: true,
    message: "Company details updated successfully",
    data: updatedCompany,
  }); 
})

export const delete_company = asyncHandler(async(req,res,next)=>{
     const company_id = req.params.companyId
  console.log("the company id is", company_id)
    if(!company_id){
        return next(new ApiError('Invalid company id',400))
    }
    const data = await Company.findByIdAndDelete(company_id)
    if(!data){
        return next(new ApiError("Unable to delete",404))
    }
    return res.status(201).json({message:"Deleted Successfully", data:data, success:true})
})

export const get_single_company = asyncHandler(async(req,res,next)=>{
     const company_id = req.params.companyId
  console.log("the company id is", company_id)
    if(!company_id){
        return next(new ApiError('Invalid company id',400))
    }
    const data = await Company.findById(company_id)
    if(!data){
        return next(new ApiError("Unable to find the company",404))
    }
    return res.status(200).json({message:"Company is returned", data:data, success:true})
})




/** for drivers */

export const add_driver = asyncHandler(async(req, res, next)=>{
  const {
    first_name,
    last_name,
    email,
    mobile,
    license,
    experience,
    address1,
    address2,
    city,
    state,
    zipcode,
  } = req.body;

  if(!first_name || !last_name || !email || !mobile || !license || !address1){
    return next(new ApiError("Invalid data",400))
  }
  const data = await Driver.create({
       first_name,
       last_name,
       email,
       mobile,
       license,
       experience,
       address1,
       address2,
       city,
       state,
       zipcode,
  })
  if(!data){
    return next(new ApiError('Failed to create the driver',402))
  }
  return res.status(201).json({message:"Successfully added the driver", data:data, success:true})
})


export const get_drivers=asyncHandler(async(req,res,next)=>{
    const search = req.query.search || ""
    const {page, limit, skip} = applyPagination(req.query)
    
    const regex = new RegExp(search, "i")
    const query = search ? {
        $or: [
          { first_name: regex },
          { last_name: regex },
          { email: regex },
          { mobile: regex },
          { city: regex },
          { state: regex },
          { address1: regex },
          { zipcode: regex },
        ],
      } : {}; 

      const [data, total] = await Promise.all([Driver.find(query).skip(skip).limit(limit).sort({ createdAt : -1 }), Driver.countDocuments(query)]);

      if(!data){
        return next(new ApiError('No Data is found',404))
      }
      const pagination={
        total:total,
        totalPages:Math.ceil(total/limit),
        page:page,
        limit:limit
      }

      return res.status(200).json({message:"Drivers are fetched", data:data, paginate:pagination,success:true})
})


export const update_driver = asyncHandler(async(req,res,next)=>{
      const driverId = req.params.driverId
    if(!driverId){
        return next(new ApiError('Invalid company id',400))
    }
    const updates = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) =>
      value !== undefined && value !== null && value !== ""
    )
  );
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId, {
        $set: updates
      }, {
        new: true,
        runValidators: true
      }
    );

    if (!updatedDriver) {
      return next(new ApiError('Driver not found', 404));
    }
    return res.status(200).json({
      success: true,
      message: "Driver details updated successfully",
      data: updatedDriver,
    });
})

export const delete_driver = asyncHandler(async (req, res, next) => {
  const driverId = req.params.driverId
   if (!driverId) {
    return next(new ApiError('Invalid driver id', 400))
  }
  const data = await Driver.findByIdAndDelete(driverId)
  if (!data) {
    return next(new ApiError("Unable to delete", 404))
  }
  return res.status(201).json({
    message: "Deleted Successfully",
    data: data,
    success: true
  })
})

export const get_single_driver = asyncHandler(async (req, res, next) => {
  const driverId = req.params.driverId
   if (!driverId) {
    return next(new ApiError('Invalid company id', 400))
  }
  const data = await Driver.findById(driverId)
  if (!data) {
    return next(new ApiError("Unable to find the driver", 404))
  }
  return res.status(200).json({
    message: "Driver is returned",
    data: data,
    success: true
  })
})
