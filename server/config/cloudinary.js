import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars if not already loaded
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

// Configurar Cloudinary
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
};

cloudinary.config(cloudinaryConfig);

// Helper function to upload image
export const uploadImage = async (imagePath, folder = 'bodipo_products') => {
    try {
        // Upload options
        const options = {
            folder: folder,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
        };

        const result = await cloudinary.uploader.upload(imagePath, options);
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Error subiendo imagen a Cloudinary');
    }
};

export default cloudinary;
