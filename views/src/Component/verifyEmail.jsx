import { useRef, useState } from "react";
import { useAuth } from "../Context/authContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";


export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState(null);
  const inputRefs = useRef([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const { resError, VerifyEmail } = useAuth();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || '';
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== '');
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const verifyCode = code.join('');
    if (verifyCode.length !== 6) {
      setCodeError('Code is not equal!');
      return;
    }

    setLoading(true);

    try {
      await VerifyEmail(verifyCode);
      setLoading(false);
      toast.success("Email verified successfully");
      nav('/changepassword');
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
              <h2 className='title'>Verify Your Email</h2>
              <p className="p-verify">Enter the 6-digit code sent to your email address</p>
              <div className="d-flex justify-content-evenly gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(eL) => { inputRefs.current[index] = eL }}
                    type='text'
                    maxLength='1'
                    className='code'
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              {codeError && (<p className="error">{codeError}</p>)}

              {error && (<p className="error">{error}</p>)}
              <button type="submit" className="btn-submit">{loading ? "Verifying..." : "Verify"}</button>
            </fieldset>
          </form>
        </div>
      </motion.div>
    </>
  );
}
