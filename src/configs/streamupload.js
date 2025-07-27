import streamifier from 'streamifier';
import cloudinary from './cloudinary.js';
import path from 'path';

/** for uplaoding file types like pdf and epub format and large files */
const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        
        const originalName = req.file.originalname;
        const ext = path.extname(originalName).toLowerCase(); 
        const baseName = path.basename(originalName, ext).replace(/\s+/g, '_');

        const stream = cloudinary.uploader.upload_stream({
                resource_type: 'raw', // important for epub/pdf
                folder: 'books',
                public_id: `${baseName}-${Date.now()}${ext}`, 
                format: ext.replace('.', '')  
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};



/** for uploading the multiple images */
export const uploadMultipleImageBuffersToCloudinary = async (files, folderName = "default") => {
    if (!Array.isArray(files) || files.length === 0) {
        return []; // no files to upload
    }

    const uploads = files.map((file) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({
                    folder: `page_pop/${folderName}`,
                    public_id: file.originalname.split(".")[0],
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else
                        resolve({
                            secure_url: result.secure_url,
                            public_id: result.public_id,
                        });
                }
            );
            stream.end(file.buffer); // after reading sending the stream to the cloudinary
        });
    });

    return await Promise.all(uploads);
};

export default streamUpload