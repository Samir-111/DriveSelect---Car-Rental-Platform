import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from 'react-hot-toast'

if (import.meta.env.VITE_BASE_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
}

export const Appcontext = createContext();

export const AppProvider = ({ children }) => {

    const navigate = useNavigate()
    const currency = import.meta.env.VITE_CURRENCY || '$'

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const [cars, setCars] = useState([])

    // Function to check if user is logged in 
    const fetchUser = async ()=>{
        try {
            const {data} = await axios.get('/api/user/data')
            if (data.success){
                const userData = data.userData || data.user
                setUser(userData)
                setIsOwner(userData?.role === 'owner')
            } else {
                navigate('/')
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to fetch all cars from the server
    const fetchCars = async () =>{
        try {
            const {data} = await axios.get('/api/user/cars')
            if (data.success) {
                setCars(data.cars)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to log out the user 
    const logout = ()=>{
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setIsOwner(false)
        axios.defaults.headers.common['Authorization'] = ''
        toast.success('You have been logged out')
    }

    // useEffect to retrieve the token from localstorage
    useEffect (()=>{
        const savedToken = localStorage.getItem('token')
        if (savedToken) {
            setToken(savedToken)
            axios.defaults.headers.common['Authorization'] = `${savedToken}`
        }
        fetchCars()
    },[])

    // useEffect to fetch data when token is available
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`
            fetchUser()
        }
    },[token])
    

    const value = {
        navigate, currency, axios, user, setUser, token, setToken, isOwner, setIsOwner, fetchUser, showLogin, setShowLogin, logout, fetchCars, cars, setCars, pickupDate, setPickupDate, returnDate, setReturnDate
    }
    return (
        <Appcontext.Provider value={value}>
            {children}
        </Appcontext.Provider>
    )
}

export const useAppCOntext = () => {
    return useContext(Appcontext)
}

export const useAppContext = useAppCOntext