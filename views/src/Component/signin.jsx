import { useState } from 'react';
import { motion } from "framer-motion";
import { useAuth } from "../Context/authContext";


export default function Signin() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { resError, signin } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError('Email is not found!');
      return;
    }

    if (!password) {
      setPasswordError('Password is not found!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signin(email, password);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(resError);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ borderRadius: '15px' }}
        className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
      >
        <div className='content'>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading}>
              <h2 className='title'>Sign in</h2>

              <div className="input-content">
                <i className="icon fas fa-envelope"></i>
                <input
                  type='email'
                  className='input-field'
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError && (<p className="error">{emailError}</p>)}

              <div className="input-content">
                <i className="icon fas fa-lock"></i>
                <input
                  type='password'
                  className='input-field'
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {passwordError && (<p className="error">{passwordError}</p>)}

              <a href='/forget-password' className='forgetPassword'>Forget Password?</a>

              {error && (<p className="error">{error}</p>)}
              <button type="submit" className="btn-submit">{loading ? "Signning in..." : "Sign in"}</button>
            </fieldset>
          </form>
        </div>
        <div className="div-link">
          <p className="signup-link">Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </motion.div>
    </>
  );
}
