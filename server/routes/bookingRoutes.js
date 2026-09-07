import express from "express";
import { 
    cancelUserBooking,
    changeBookingStatus, 
    checkAvailablityOfCar, 
    createBooking, 
    createRazorpayOrder,
    getCarBookedDates,
    getOwnerBookings, 
    getUserBookings,
    verifyRazorpayPayment
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.get('/car-booked-dates/:carId', getCarBookedDates);
bookingRouter.post('/check-availablity', checkAvailablityOfCar);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.post('/cancel', protect, cancelUserBooking);
bookingRouter.post('/razorpay-order', protect, createRazorpayOrder);
bookingRouter.post('/verify-razorpay', protect, verifyRazorpayPayment);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/owner-status', protect, changeBookingStatus);

export default bookingRouter;