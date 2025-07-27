import mongoose from "mongoose";
import streamUpload from "../configs/streamupload.js";
import Associated_Member from "../models/AssociatedMembers.js";
import { Book } from "../models/Book.js";
import { Book_Order } from "../models/BookOrders.js";
import { Documents } from "../models/Documents.js";
import { User } from "../models/User.js";
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";

export const getUserProfile =asyncHandler(async(req,res,next)=>{
    const user = req.user
    const data = await User.findById({_id:user?._id}).select('-refreshToken -password')
    
    if(!data){
        return next(new ApiError('Unable to get the profile',400))
    }
    res.staus(200).json({message:"Profile recieved successfully",data:data,success:true})
 })

 export const uploadVerificationDocuments = asyncHandler(async(req,res,next)=>{
    const { userId } = req.body
    const { gst_document , registration_document }= req.files
    console.log("the req files are", req.files)

    const existingDoc = await Documents.findOne({
        userId: userId
    });
    if (existingDoc) {
        return res.status(400).json({
            message: "Documents already submitted",
            success: false,
        });
    }


    const gst_upload_result = await streamUpload({ file:gst_document[0]})
    const registration_upload_result= await streamUpload({file: registration_document[0]})
    let document_create = await Documents.create({userId:userId})
    if(!gst_upload_result && !registration_upload_result){
      return res.status(400).json({message:"Unable to upload the files",success:false})
    }
    if(gst_upload_result) {
        document_create.gst_document = {
            secure_url: gst_upload_result.url,
            public_id: gst_upload_result.public_id
        };
    }

    if(registration_upload_result) {
        document_create.registration_document = {
            secure_url: registration_upload_result.url,
            public_id: registration_upload_result.public_id
        };
    }
    await document_create.save()
    return res.status(201).json({message:"Uploaded documents for verification", success:true, data: document_create})
 })


 export const get_users_bought_books= asyncHandler(async(req,res,next)=>{
    const id = req?.user?._id
    const { userId } = req.body


    if(!userId){
        return next(new ApiError("Inavalid user id",400))
    }
    const data = await Book_Order.find({buyer_id:userId}).populate(['book_details.book_id','book_details.category'])
    return res.status(200).json({message:"Your purchased books",data:data,success:true})
 })

/**for adding members in the organization */

export const add_associated_members = asyncHandler(async(req,res,next)=>{
    const { associated_organisation,unique_login_identification ,name,isVerified , password}= req.body
    // console.log("the organisation is", associated_organisation)
    if(!associated_organisation || !unique_login_identification || !name){
        return next(new ApiError("Invalid request",400))
    }
    const data = await Associated_Member.create({
        name:name,
        unique_login_identification:unique_login_identification,
        associated_organisation:associated_organisation,
        isVerified,
        password
    })
    if(!data){
        return res.status(404).json({message:"Failed to add the member",success:false})
    }
   const userData= await User.findByIdAndUpdate(associated_organisation, {
       associated_members: data._id
   });
    if(!userData){
        return next(new ApiError("Unable to find the organisation",400))
    }
    res.status(201).json({message:"Successfully added the associated member to the organisation",success:true})
})


export const remove_associated_member = asyncHandler(async(req,res,next)=>{
    const publisherId = req.user._id
    const memberId  = req.params.userId

    if(!memberId){
        return next(new ApiError('User id is required',400))
    }
    const member_exists = await Associated_Member.findByIdAndDelete(memberId)
    if(!member_exists){
        return res.status(200).json({message:"Failed to delete the user", success:false})
    }
    const publisher = await User.findOneAndUpdate(
        publisherId, {
        $pull: {
            associated_members: memberId
        }
        }, {
            new: true
        })

    if(!publisher){
        return res.status(404).json({message:"Failed to update the Publisher",success:false})
    }
    res.status(201).json({message:"Successfully removed the Member",success:true})
})


export const get_all_associated_member = asyncHandler(async (req, res, next) => {
    const publisherId = req.user._id;
    console.log("the pulisher")
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Step 1: Get the publisher with only IDs of associated members
    const publisher = await User.findById(publisherId).select('associated_members');

    if (!publisher) {
        return res.status(404).json({
            message: 'Publisher not found',
            success: false
        });
    }

    console.log("the publisher", publisher)

    const totalMembers = publisher.associated_members.length;

    // Step 2: Paginate manually using IDs
    const paginatedIds = publisher.associated_members.slice(skip, skip + limit);

    const members = await Associated_Member.find({
        _id: {
            $in: paginatedIds
        }
    });

    res.status(200).json({
        success: true,
        count: members.length,
        total: totalMembers,
        page,
        totalPages: Math.ceil(totalMembers / limit),
        data: members
    });
});


export const get_member_by_id = asyncHandler(async(req,res,next)=>{
    const memberId = req.params.userId
    const role = req.user.role
    console.log("the role is", role, memberId)
    if(!memberId){
        return next(new ApiError('Invalid member id',400))
    }
    const data  = await Associated_Member.findById(memberId).select('-password')
    if(!data){
        return next(new ApiError('Unable to find the Member',404))
    }
      const books = await Book.aggregate([{
              $match: {
                  associated_member_id: new mongoose.Types.ObjectId(memberId)
              }
          },
          {
              $lookup: {
                  from: "User",
                  localField: "publisherId",
                  foreignField: "_id",
                  as: "publisher"
              }
          },
          {
              $unwind: {
                  path: "$publisher",
                  preserveNullAndEmptyArrays: true
              }
          },
          {
              $lookup: {
                  from: "categories",
                  localField: "category",
                  foreignField: "_id",
                  as: "category"
              }
          },
          {
              $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: true
              }
          },
          {
              $project: {
                  title: 1,
                  author: 1,
                  description: 1,
                  price: 1,
                  type: 1,
                  version: 1,
                  bookCoverImages: 1,
                  previewPages: 1,
                  bookUrl: 1,
                  categoryName: "$category.name",
                  publisherName: "$publisher.name",
                  createdAt: 1
              }
          }
      ]);
    return res.status(200).json({message:"Members data recieved successfully",data:{data, books},success:false})
})

/** for when using the paginated also */

// export const get_member_by_id = asyncHandler(async (req, res, next) => {
//     const memberId = req.params.userId;
//     const role = req.user.role;
//     console.log("the role is", role, memberId);

//     if (!memberId) {
//         return next(new ApiError('Invalid member id', 400));
//     }

//     const data = await Associated_Member.findById(memberId).select('-password');
//     if (!data) {
//         return next(new ApiError('Unable to find the Member', 404));
//     }

//     // Extract pagination query params
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const booksResult = await Book.aggregate([{
//             $match: {
//                 associated_member_id: new mongoose.Types.ObjectId(memberId)
//             }
//         },
//         {
//             $facet: {
//                 metadata: [{
//                     $count: "total"
//                 }],
//                 data: [{
//                         $sort: {
//                             createdAt: -1
//                         }
//                     },
//                     {
//                         $skip: skip
//                     },
//                     {
//                         $limit: limit
//                     },
//                     {
//                         $lookup: {
//                             from: "User",
//                             localField: "publisherId",
//                             foreignField: "_id",
//                             as: "publisher"
//                         }
//                     },
//                     {
//                         $unwind: {
//                             path: "$publisher",
//                             preserveNullAndEmptyArrays: true
//                         }
//                     },
//                     {
//                         $lookup: {
//                             from: "categories",
//                             localField: "category",
//                             foreignField: "_id",
//                             as: "category"
//                         }
//                     },
//                     {
//                         $unwind: {
//                             path: "$category",
//                             preserveNullAndEmptyArrays: true
//                         }
//                     },
//                     {
//                         $project: {
//                             title: 1,
//                             author: 1,
//                             description: 1,
//                             price: 1,
//                             type: 1,
//                             version: 1,
//                             bookCoverImages: 1,
//                             previewPages: 1,
//                             bookUrl: 1,
//                             categoryName: "$category.name",
//                             publisherName: "$publisher.name",
//                             createdAt: 1
//                         }
//                     }
//                 ]
//             }
//         },
//         {
//             $project: {
//                 total: {
//                     $arrayElemAt: ["$metadata.total", 0]
//                 },
//                 data: 1
//             }
//         }
//     ]).allowDiskUse(true);

//     const books = booksResult[0] || {
//         total: 0,
//         data: []
//     };

//     return res.status(200).json({
//         message: "Members data received successfully",
//         data: {
//             data,
//             books
//         },
//         success: true
//     });
// });
