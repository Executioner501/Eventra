import { useState } from 'react';
import { CheckCircle, XCircle, Shield, Ticket } from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';

export default function VerifyTicket() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  // Update this to your Django backend URL
  const API_BASE_URL = 'http://localhost:8000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/volunteer/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setVolunteerName(data.name);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      // Direct call to Django backend
      const response = await fetch(`${API_BASE_URL}/api/volunteer/verify-ticket/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
          otp_code: otpCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult({
          success: true,
          ticket: data.ticket,
          message: data.message
        });
        setOtpCode('');
      } else {
        setVerificationResult({
          success: false,
          message: data.error || 'Verification failed'
        });
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
    setVolunteerName('');
    setOtpCode('');
    setVerificationResult(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          
          {!isLoggedIn ? (
            /* Login Form */
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-indigo-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Login</h1>
                <p className="text-gray-600">Enter your credentials to verify tickets</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          ) : (
            /* Verification Form */
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="text-green-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Ticket Verification</h1>
                <p className="text-gray-600">Welcome, {volunteerName}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Logout
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {verificationResult && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  verificationResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {verificationResult.success ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        verificationResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {verificationResult.message}
                      </p>
                      {verificationResult.success && verificationResult.ticket && (
                        <div className="mt-2 text-sm text-green-800 space-y-1">
                          <p><strong>Event:</strong> {verificationResult.ticket.event}</p>
                          <p><strong>Customer:</strong> {verificationResult.ticket.customer}</p>
                          <p><strong>Ticket #:</strong> {verificationResult.ticket.ticket_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    pattern="[0-9]{6}"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Enter the 6-digit code from the ticket
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Validate Ticket'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  🔒 All verifications are logged and tracked
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}