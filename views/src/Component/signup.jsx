import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../Context/authContext";


export default function Signup() {
  const [fullname, setFullname] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [fullnameError, setFullnameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { resError, signup } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFullnameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setError(null);

    if (!fullname) {
      setFullnameError('Full name is not found!');
      return;
    }

    if (!email) {
      setEmailError('Email is not found!');
      return;
    }

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
      await signup(fullname, email, password);
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
              <h2 className='title'>Create Account</h2>

              <div className="input-content">
                <i className="icon fas fa-user"></i>
                <input
                  type="text"
                  className="input-field"
                  name="fullname"
                  placeholder="Full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              {fullnameError && (<p className="error">{fullnameError}</p>)}

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
              <button type="submit" className="btn-submit">{loading ? "Signning up..." : "Sign up"}</button>
            </fieldset>
          </form>
        </div>
        <div className="div-link">
          <p className="signup-link">Already have an account? <a href="/signin">Sign in</a></p>
        </div>
      </motion.div>
    </>
  );
}
