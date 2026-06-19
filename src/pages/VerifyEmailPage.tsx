import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { APP_NAME, AUTH_SERVER_URL } from '@/constants';
import axios from 'axios';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = location.state?.email || searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please sign up again.');
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Extract only digits
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newCode = digits.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${AUTH_SERVER_URL}/api/auth/verify-email`, {
        email,
        code: verificationCode
      });

      if (response.data.success) {
        setVerified(true);
        toast.success('Email verified successfully!');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Your account is now verified. Please log in.' }
          });
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      const attemptsLeft = error.response?.data?.attemptsLeft;
      
      if (attemptsLeft !== undefined) {
        toast.error(`${errorMessage} (${attemptsLeft} attempts left)`);
      } else {
        toast.error(errorMessage);
      }
      
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    
    try {
      const response = await axios.post(`${AUTH_SERVER_URL}/api/auth/resend-code`, {
        email
      });

      if (response.data.success) {
        toast.success('New verification code sent to your email');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center px-4"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-green-500/50">
            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Redirecting to login...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-4 sm:mb-6">
          <Link to="/" className="inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-blue-500/50 dark:shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/60 dark:hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </motion.div>
          </Link>
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent px-4">
              {APP_NAME}
            </h1>
          </Link>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2 font-medium px-4">
            Verify Your Email
          </p>
        </div>

        <Card className="border border-gray-200 dark:border-slate-700/50 bg-white/98 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl dark:shadow-blue-500/10 overflow-hidden">
          <CardHeader className="space-y-1.5 sm:space-y-2 pb-4 sm:pb-6 bg-gradient-to-br from-transparent to-blue-50/50 dark:to-blue-950/30 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-900 dark:text-slate-100 font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
              We sent a 6-digit verification code to
              <br />
              <strong className="text-blue-600 dark:text-blue-400 break-all">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-3 sm:px-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 sm:mb-3 text-center">
                Enter Verification Code
              </label>
              <div className="flex gap-1.5 sm:gap-2 justify-center px-2 sm:px-0" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-bold bg-gray-50 dark:bg-slate-800/80 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all rounded-lg"
                    disabled={loading || verified}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-2 sm:mt-3 px-2">
                Tip: You can paste the code directly
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resending || loading}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-xs sm:text-sm h-8 sm:h-10"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4 pb-4 sm:pb-6 px-4 sm:px-6">
            <Button
              onClick={handleVerify}
              className="w-full h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm sm:text-base font-semibold shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-500/30 transition-all duration-300"
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Verifying...
                </span>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>

            <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-slate-400 px-2">
              Wrong email?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Sign up again
              </button>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50 space-y-1.5 sm:space-y-2 mx-2 sm:mx-0">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Did not get the email?</strong> Check your spam or promotions folder and mark it as &quot;Not spam&quot; so future codes arrive in your inbox.
          </p>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            The message subject is <strong>Verify your StegaGen Secure account</strong>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
