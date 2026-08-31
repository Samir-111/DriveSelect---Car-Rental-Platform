# DriveSelect - Car Rental Platform

DriveSelect is a full-stack car rental web application built using the MERN stack (MongoDB, Express, React, Node.js). The platform connects car owners with renters, allowing users to browse and book vehicles while providing owners with tools to manage their listings and rental requests.

## Tech Stack

### Frontend (Client)
- **React 19 + Vite**: Fast, interactive single-page web application.
- **Tailwind CSS v4**: Modern, responsive UI design and layout.
- **Motion (Framer Motion)**: Smooth animations and page transitions.
- **React Router DOM v7**: Client-side page navigation.
- **Axios & React Hot Toast**: API integration and instant user notifications.

### Backend (Server)
- **Node.js & Express.js v5**: RESTful API backend architecture.
- **MongoDB & Mongoose v9**: NoSQL database for users, cars, and bookings data.
- **JWT & Bcrypt**: Secure user authentication and password encryption.
- **Multer & ImageKit API**: Cloud image upload pipeline for vehicle listings.

---

## Key Features

### For Customers
- Search and filter cars by category, seats, fuel type, transmission, and daily price.
- Select rental dates with automatic total price calculation.
- View and track booking status (Pending, Confirmed, Cancelled).

### For Car Owners
- Owner dashboard with analytics (listed cars, bookings, revenue).
- Add new car listings with image uploads handled via ImageKit API.
- Manage existing fleet (edit details, toggle availability, delete listings).
- Accept or reject booking requests from customers.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (Local or MongoDB Atlas)
- ImageKit account for media uploads

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Samir-111/Car_Rental_FullStack.git
   cd Car_Rental_FullStack
   ```

2. **Setup and run the backend server:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```
   Start the server:
   ```bash
   npm run server
   ```

3. **Setup and run the frontend client:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_BASE_URL=http://localhost:3000
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

---

## API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | /api/user/register | Register a new user |
| POST | /api/user/login | User login and token generation |
| GET | /api/user/cars | Get all available cars |
| POST | /api/owner/add-car | Add a new car listing |
| GET | /api/owner/dashboard | Get owner statistics |
| POST | /api/bookings/create | Book a vehicle |
| GET | /api/bookings/my-bookings | Get customer booking history |
| POST | /api/bookings/change-status | Update booking status |
