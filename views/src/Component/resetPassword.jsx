import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";


export default function ResetPassword() {
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { resError, resetPassword } = useAuth();
  const nav = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setConfirmPasswordError(null);
    setError(null);

    if (!password) {
      setPasswordError('Password is not found!');
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm Password is not found!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password & Confirm Password is not equal!');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(password);
      setLoading(false);
      nav('/signin');
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
              <h2 className='title'>Reset Password</h2>

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

              <div className="input-content">
                <i className="icon fas fa-lock"></i>
                <input
                  type='password'
                  className='input-field'
                  name="repassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {confirmPasswordError && (<p className="error">{confirmPasswordError}</p>)}

              {error && (<p className="error">{error}</p>)}
              <button type="submit" className="btn-submit">{loading ? "Submitting..." : "Submit"}</button>
            </fieldset>
          </form>
        </div>
      </motion.div>
    </>
  );
}
