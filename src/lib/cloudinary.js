import { v2 as cloudinary } from 'cloudinary'

console.log('=== CLOUDINARY SETUP ===');
console.log('Environment variables:');
console.log('- Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? 'ADA' : 'TIDAK ADA');
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? 'ADA' : 'TIDAK ADA');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('Cloudinary config result:', cloudinary.config());

export default cloudinary