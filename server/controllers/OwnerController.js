import imagekit from "../config/imageKit.js";
import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import fs from "fs";

export const changeRoleToOwner = async (req, res) => {
    try { 
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" });
        res.json({ success: true, message: "Now you can list car " });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to list car
export const addCar = async (req, res) => {
/*
====================================================================
                FLOW: CONTROLLER + MULTIPART FORM-DATA
====================================================================

Frontend (Add Car Form)
    │
    │ POST /api/cars
    │ Body: { text data + [FILE] image }
    │ Content-Type: multipart/form-data
    ▼
[ multer middleware]
    │ req.file ✅ | req.body ✅
    ▼
[ OwnerController.addCar ]
    │
    │ 1. req.user se ownerId nikala
    │ 2. JSON.parse(req.body.carData) kiya
    │ 3. ImageKit mein upload kiya
    │ 4. Car create kiya
    │
    ▼
res.json({ success: true, message: "Car added successfully" })
*/

    try {
        const { _id } = req.user;
        let carData = JSON.parse(req.body.carData);
        
        // Support multiple uploaded images from req.files or single from req.file
        let imageFiles = [];
        if (req.files && req.files.length > 0) {
            imageFiles = req.files;
        } else if (req.file) {
            imageFiles = [req.file];
        }

        if (imageFiles.length === 0) {
            return res.json({ success: false, message: "Car image is required" });
        }

        // Upload all images to ImageKit in parallel
        const uploadPromises = imageFiles.map(async (file) => {
            const fileBuffer = fs.readFileSync(file.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: file.originalname,
                folder: '/cars'
            });

            return imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: '1280' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            });
        });

        const imageUrls = await Promise.all(uploadPromises);
        const image = imageUrls[0] || '';
        const images = imageUrls;

        await Car.create({ ...carData, owner: _id, image, images });

        res.json({ success: true, message: "Car added successfully" });

    } catch (error) { 
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to list owner cars 
export const getOwnerCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id });
        res.json({ success: true, cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to toggle cars availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
       
        // checking if car belongs to user 
        if (!car || car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.isAvailable = !car.isAvailable;
        if (car.isAvaliable !== undefined) {
            car.isAvaliable = !car.isAvaliable;
        }
        await car.save();

        res.json({ success: true, message: "Availability toggled" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const toggleCarAvailablity = toggleCarAvailability;
export const togg = toggleCarAvailability;

// API to Delete cars 
export const deleteCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;
        const car = await Car.findById(carId);
       
        // checking if car belongs to user 
        if (!car || car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        await Car.findByIdAndDelete(carId);

        res.json({ success: true, message: "Car Removed" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const deleteCars = deleteCar;

// API to update car details
export const updateCar = async (req, res) => {
    try {
        const { _id } = req.user;
        const carId = req.body.carId;
        
        const car = await Car.findById(carId);
        if (!car || car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized or car not found" });
        }

        let updatedData = {};
        if (req.body.carData) {
            try {
                updatedData = typeof req.body.carData === 'string' ? JSON.parse(req.body.carData) : req.body.carData;
            } catch (err) {
                updatedData = req.body;
            }
        } else {
            updatedData = { ...req.body };
        }

        // Handle new images if uploaded
        let imageFiles = [];
        if (req.files && req.files.length > 0) {
            imageFiles = req.files;
        } else if (req.file) {
            imageFiles = [req.file];
        }

        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(async (file) => {
                const fileBuffer = fs.readFileSync(file.path);
                const response = await imagekit.upload({
                    file: fileBuffer,
                    fileName: file.originalname,
                    folder: '/cars'
                });
                return imagekit.url({
                    path: response.filePath,
                    transformation: [
                        { width: '1280' },
                        { quality: 'auto' },
                        { format: 'webp' }
                    ]
                });
            });

            const newImageUrls = await Promise.all(uploadPromises);
            updatedData.images = newImageUrls;
            updatedData.image = newImageUrls[0];
        }

        const updatedCar = await Car.findByIdAndUpdate(carId, { $set: updatedData }, { new: true });

        res.json({ success: true, message: "Car details updated successfully", car: updatedCar });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Dashboard data 
export const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;

        if (role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }
        const cars = await Car.find({ owner: _id });
        const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

        const pendingBookings = await Booking.find({ owner: _id, status: "pending" });
        const completedBookings = await Booking.find({ owner: _id, status: "confirmed" });

        // Calculate total gross and net metrics
        const totalRevenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((acc, b) => acc + (b.price || 0), 0);

        const platformFeeEarned = Math.round(totalRevenue * 0.10);
        const ownerNetRevenue = totalRevenue - platformFeeEarned;

        // Cash vs Online Breakdown
        const cashBookings = bookings.filter(b => b.paymentMethod?.toLowerCase().includes('pickup') || b.paymentStatus === 'pending');
        const totalCashCollected = cashBookings.reduce((acc, b) => acc + (b.price || 0), 0);
        const cashCommissionDue = Math.round(totalCashCollected * 0.10);

        const ownerUser = await User.findById(_id);

        const dashboardData = { 
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0, 4),
            monthlyRevenue: totalRevenue,
            grossRevenue: totalRevenue,
            ownerNetRevenue,
            platformFeeEarned,
            cashCollected: ownerUser?.wallet?.cashCollected || totalCashCollected,
            platformCommissionDue: ownerUser?.wallet?.platformCommissionDue !== undefined ? ownerUser.wallet.platformCommissionDue : cashCommissionDue,
            onlineSettled: ownerUser?.wallet?.onlineSettled || 0
        };

        res.json({ success: true, dashboardData, dadhbordData: dashboardData });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to update user image 
export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;
        if (!imageFile) {
            return res.json({ success: false, message: "Profile image is required" });
        }

        // upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        });

        // optimization through imagekit URL transformation
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width: '400'}, // Width resizing
                {quality: 'auto'}, // Auto compression
                { format: 'webp' } // Convert to modern format
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, { image });
        res.json({ success: true, message: "Image Updated" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get owner bank details and commission wallet
export const getBankDetails = async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id).select("bankDetails wallet name email");
        res.json({
            success: true,
            bankDetails: user?.bankDetails || {},
            wallet: user?.wallet || { totalEarned: 0, cashCollected: 0, platformCommissionDue: 0, onlineSettled: 0 }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to update owner bank & payout details
export const updateBankDetails = async (req, res) => {
    try {
        const { _id } = req.user;
        const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                bankDetails: {
                    accountHolderName: accountHolderName || '',
                    accountNumber: accountNumber || '',
                    ifscCode: ifscCode || '',
                    bankName: bankName || '',
                    upiId: upiId || '',
                    isConfigured: Boolean(accountNumber || upiId)
                }
            },
            { new: true }
        ).select("bankDetails wallet");

        res.json({
            success: true,
            message: "Bank & Payout details saved successfully! You are ready to receive payouts.",
            bankDetails: updatedUser.bankDetails,
            wallet: updatedUser.wallet
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Clear Pending Platform Commission (Model 2: Direct UPI/Card payment by owner)
export const clearCommissionDue = async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id);
        const dueAmount = user?.wallet?.platformCommissionDue || 0;

        if (dueAmount <= 0) {
            return res.json({ success: true, message: "No pending platform commission dues!" });
        }

        // Reset commission due to 0
        await User.findByIdAndUpdate(_id, {
            $set: { 'wallet.platformCommissionDue': 0 }
        });

        // Mark all 'due' bookings of this owner as 'paid_direct'
        await Booking.updateMany(
            { owner: _id, commissionStatus: 'due' },
            { $set: { commissionStatus: 'paid_direct' } }
        );

        res.json({
            success: true,
            message: `Platform commission of ₹${dueAmount} cleared successfully via UPI!`
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};