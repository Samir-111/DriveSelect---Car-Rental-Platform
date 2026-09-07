/*
====================================================================
                     MULTER FILE UPLOAD MIDDLEWARE
====================================================================

Multer kya karta hai?
1. Normal text data ko Express `express.json()` se padh leta hai.
2. Lekin jab Car ki PHOTO (File/Image) aati hai (multipart/form-data),
   tab Express use directly nahi padh pata.
3. Multer us image file ko pakadta hai, temporary storage mein rakhta hai,
   aur controller ko `req.file` ke andar provide karta hai taaki hum 
   ImageKit / Cloudinary par upload kar sakein.

Flow:
Frontend (Car Image) ──► Multer Middleware (`req.file`) ──► Controller (ImageKit Upload)
====================================================================
*/

import multer from "multer";
const upload = multer({storage: multer.diskStorage({})})

export default upload