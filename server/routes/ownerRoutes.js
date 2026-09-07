import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { 
    addCar, 
    changeRoleToOwner, 
    deleteCar, 
    getDashboardData, 
    getOwnerCars, 
    toggleCarAvailability,
    updateCar,
    updateUserImage 
} from "../controllers/OwnerController.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);
ownerRouter.post("/add-car", protect, upload.any(), addCar);
ownerRouter.post("/update-car", protect, upload.any(), updateCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.get('/dashboard', protect, getDashboardData);
ownerRouter.post('/update-image', protect, upload.single("image"), updateUserImage);

export default ownerRouter;
