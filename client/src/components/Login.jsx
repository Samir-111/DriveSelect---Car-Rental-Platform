import React from 'react'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import { assets } from '../assets/assets'

const Login = () => {
  const { setShowLogin, axios, setToken, fetchUser } = useAppContext();

  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const switchState = (newState) => {
    setState(newState);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === "register") {
        const { data } = await axios.post('/api/user/register', { name, email, password });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
          axios.defaults.headers.common['Authorization'] = `${data.token}`;
          fetchUser();
          setShowLogin(false);
          toast.success("Account created successfully");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post('/api/user/login', { email, password });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
          axios.defaults.headers.common['Authorization'] = `${data.token}`;
          fetchUser();
          setShowLogin(false);
          toast.success("Logged in successfully");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div onClick={() => setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>
      <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} autoComplete="off" className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="type here"
              required
              autoComplete="off"
              className="border border-borderColor rounded-md w-full px-3 py-2 outline-none mt-1"
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            type="email"
            placeholder="type here"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className='border border-borderColor rounded-md w-full px-3 py-2 outline-none mt-1'
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <div className='relative flex items-center mt-1'>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="type here"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className='border border-borderColor rounded-md w-full px-3 py-2 pr-10 outline-none'
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-2.5 text-gray-500 hover:text-gray-700 cursor-pointer flex items-center justify-center p-1 focus:outline-none'
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <img
                src={showPassword ? assets.eye_close_icon : assets.eye_icon}
                alt="Toggle password visibility"
                className='w-5 h-5 opacity-70 hover:opacity-100 transition-opacity'
              />
            </button>
          </div>
        </div>

        {state === 'login' && (
          <div className='flex justify-end w-full'>
            <span className='text-xs text-primary hover:underline cursor-pointer'>
              Forgot password?
            </span>
          </div>
        )}

        <button
          type="submit"
          className='w-full py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dull transition-colors cursor-pointer mt-2'
        >
          {state === 'register' ? 'Sign Up' : 'Login'}
        </button>

        <div className='text-center text-xs text-gray-500 mt-2 w-full'>
          {state === 'register' ? (
            <p>
              Already have an account?{' '}
              <span
                onClick={() => switchState('login')}
                className='text-primary font-medium hover:underline cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <span
                onClick={() => switchState('register')}
                className='text-primary font-medium hover:underline cursor-pointer'
              >
                Sign up here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login


