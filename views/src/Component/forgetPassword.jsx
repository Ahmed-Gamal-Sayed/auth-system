import React, { useState } from "react";
import { useAuth } from "../Context/authContext";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

export default function ForgetPassword() {
  const [email, setEmail] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { resError, forgetPassword } = useAuth();
  const nav = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(null);
    setError(null);

    if (!email) {
      setEmailError('Email is not found!');
      return;
    }

    setLoading(true);

    try {
      await forgetPassword(email);
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
              <h2 className='title'>Check Account</h2>

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

              {error && (<p className="error">{error}</p>)}
              <button type="submit" className="btn-submit">Checking Account</button>
            </fieldset>
          </form>
        </div>
        <div className="div-link">
          <p class="signup-link">Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </motion.div>
    </>
  );
}
