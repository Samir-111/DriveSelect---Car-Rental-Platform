import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// function to check the availability of the car for the given dates
const checkAvailablity = async (carId, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car: carId,
        pickupDate: { $lte: new Date(returnDate) },
        returnDate: { $gte: new Date(pickupDate) },
        status: { $ne: "cancelled" }
    });
    return bookings.length === 0;
};

// API to check availability of cars for given date and location
export const checkAvailablityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body;

        const cars = await Car.find({ location, $or: [{ isAvailable: true }, { isAvaliable: true }] });

        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailablity(car._id, pickupDate, returnDate);
            return { ...(car._doc || car.toObject()), isAvailable };
        });

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true);

        res.json({ success: true, availableCars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to create Booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { car, pickupDate, returnDate } = req.body;

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if (isNaN(picked.getTime()) || isNaN(returned.getTime())) {
            return res.json({ success: false, message: "Invalid pickup or return date" });
        }

        if (returned < picked) {
            return res.json({ success: false, message: "Return date cannot be before pickup date" });
        }

        const isAvailable = await checkAvailablity(car, pickupDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Car is not available for selected dates" });
        }

        const carData = await Car.findById(car);
        if (!carData) {
            return res.json({ success: false, message: "Car not found" });
        }

        const diffTime = returned.getTime() - picked.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const noOfDays = Math.max(1, diffDays);
        const price = (carData.pricePerDay || carData.price || 0) * noOfDays;

        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price
        });

        res.json({ success: true, message: "Booking Created" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to list user bookings
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getUserBooings = getUserBookings;

// API to get owner bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('car user')
            .select("-user.password")
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const getOwnerBooings = getOwnerBookings;

// API to change booking status
export const changeBookingStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking || booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

export const changeBooingStatus = changeBookingStatus;