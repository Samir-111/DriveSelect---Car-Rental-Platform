import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: "Car", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    price: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    ownerEarning: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Pay on Pickup' },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    commissionStatus: { type: String, enum: ["due", "deducted", "settled", "paid_direct"], default: "due" },
    transactionId: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: String, enum: ["user", "owner", "admin", ""], default: "" },
    cancelledAt: { type: Date },
    refundStatus: { type: String, enum: ["not_applicable", "initiated", "refunded", "failed"], default: "not_applicable" },
    refundAmount: { type: Number, default: 0 }
}, { timestamps: true })

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

export default Booking