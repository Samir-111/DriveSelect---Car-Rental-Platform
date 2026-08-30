import User from "../models/User.js"
import Car from "../models/Car.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret_key')
}

// Register User
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body 

        if (!name || !email || !password || password.length < 8) {
            return res.json({ success: false, message: 'Fill all the fields (Password min 8 chars)' })
        }
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword })
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }
        const token = generateToken(user._id.toString())
        res.json({ success: true, token })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.body.userId || req.userId || (req.user && (req.user._id || req.user.id));
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, userData: user, user: user });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


// Get user data using token (JWT)
export const getUserdata = async (req, res) =>{
    try {
        const {user} = req;
        res.json({success: true, user, userData: user})
    }catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// get all cars for frontend 
export const getCars = async (req, res) =>{
    try {
        const cars = await Car.find({ $or: [{ isAvailable: true }, { isAvaliable: true }] })
        res.json({success: true, cars})     
    }catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}



