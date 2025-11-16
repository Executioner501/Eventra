import { useState, useEffect } from 'react';
import { useRouter } from "next/router";
import { CheckCircle, XCircle, Shield, Ticket, Crown } from 'lucide-react';

export default function VerifyTicket() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(''); // 'admin' or 'volunteer'
  const [userName, setUserName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  // Check if admin is already logged in (from admin panel)
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_access_token');
    const adminName = localStorage.getItem('admin_name');
    
    if (adminToken && adminName) {
      setIsLoggedIn(true);
      setUserType('admin');
      setUserName(adminName);
      setAccessToken(adminToken);
      setRefreshToken(localStorage.getItem('admin_refresh_token') || '');
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Try volunteer login first
      const volunteerResponse = await fetch(`${API_BASE_URL}/api/volunteer/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const volunteerData = await volunteerResponse.json();

      if (volunteerResponse.ok && volunteerData.success) {
        // Volunteer login successful
        setIsLoggedIn(true);
        setUserType('volunteer');
        setUserName(volunteerData.name);
        setAccessToken(volunteerData.access);
        setRefreshToken(volunteerData.refresh);
        
        localStorage.setItem('volunteer_access_token', volunteerData.access);
        localStorage.setItem('volunteer_refresh_token', volunteerData.refresh);
        localStorage.setItem('volunteer_name', volunteerData.name);
      } else {
        // Try admin login
        const adminResponse = await fetch(`${API_BASE_URL}/api/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        const adminData = await adminResponse.json();

        if (adminResponse.ok && adminData.access) {
          // Admin login successful
          setIsLoggedIn(true);
          setUserType('admin');
          setUserName('Admin');
          setAccessToken(adminData.access);
          setRefreshToken(adminData.refresh);
          
          localStorage.setItem('admin_access_token', adminData.access);
          localStorage.setItem('admin_refresh_token', adminData.refresh);
          localStorage.setItem('admin_name', 'Admin');
        } else {
          setError('Invalid credentials');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.access);
        const storageKey = userType === 'admin' ? 'admin_access_token' : 'volunteer_access_token';
        localStorage.setItem(storageKey, data.access);
        return data.access;
      } else {
        handleLogout();
        return null;
      }
    } catch (err) {
      handleLogout();
      return null;
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      let token = accessToken;
      
      // Choose endpoint based on user type
      const endpoint = userType === 'admin' 
        ? `${API_BASE_URL}/api/admin/verify-ticket/`
        : `${API_BASE_URL}/api/volunteer/verify-ticket/`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp_code: otpCode })
      });

      // If 401, try refreshing token
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
          setError('Session expired. Please login again.');
          return;
        }
        
        // Retry with new token
        const retryResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ otp_code: otpCode })
        });

        const data = await retryResponse.json();
        handleVerificationResponse(retryResponse, data);
      } else {
        const data = await response.json();
        handleVerificationResponse(response, data);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationResponse = (response, data) => {
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
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
    setUserName('');
    setUserType('');
    setAccessToken('');
    setRefreshToken('');
    setOtpCode('');
    setVerificationResult(null);
    
    // Clear localStorage
    localStorage.removeItem('volunteer_access_token');
    localStorage.removeItem('volunteer_refresh_token');
    localStorage.removeItem('volunteer_name');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_name');
  };

  const handleBackButton = () => {
    if (userType === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/home');
    }
  };

  return (
    <>
      {/* Back Button */}
      <div className="absolute top-6 left-6 text-sm text-gray-600">
        <button onClick={handleBackButton} className="flex items-center gap-1 hover:text-blue-600">
          ← Back to {userType === 'admin' ? 'Dashboard' : 'Home'}
        </button>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="w-[420px] max-w-full">
          {!isLoggedIn ? (
            /* Login Form */
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-indigo-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Verification</h1>
                <p className="text-gray-600">Login as Admin or Volunteer</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter password"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          ) : (
            /* Verification Form */
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${userType === 'admin' ? 'bg-purple-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {userType === 'admin' ? (
                    <Crown className="text-purple-600" size={32} />
                  ) : (
                    <Ticket className="text-green-600" size={32} />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Ticket Verification</h1>
                <p className="text-gray-600">
                  Welcome, {userName} 
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${userType === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {userType === 'admin' ? 'Admin' : 'Volunteer'}
                  </span>
                </p>
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
                <div
                  className={`mb-4 p-4 rounded-lg border ${
                    verificationResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {verificationResult.success ? (
                      <CheckCircle
                        className="text-green-600 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                    ) : (
                      <XCircle
                        className="text-red-600 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          verificationResult.success
                            ? 'text-green-900'
                            : 'text-red-900'
                        }`}
                      >
                        {verificationResult.message}
                      </p>
                      {verificationResult.success &&
                        verificationResult.ticket && (
                          <div className="mt-2 text-sm text-green-800 space-y-1">
                            <p>
                              <strong>Event:</strong>{' '}
                              {verificationResult.ticket.event}
                            </p>
                            <p>
                              <strong>Customer:</strong>{' '}
                              {verificationResult.ticket.customer}
                            </p>
                            <p>
                              <strong>Ticket #:</strong>{' '}
                              {verificationResult.ticket.ticket_number}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
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
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ''))
                    }
                    onKeyPress={(e) => e.key === 'Enter' && otpCode.length === 6 && handleVerify()}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000000"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Validate Ticket'}
                </button>
              </div>

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