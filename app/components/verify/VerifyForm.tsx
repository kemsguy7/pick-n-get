// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Check, Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import AppLayout from '../layout/AppLayout';
// import { useAuthStore } from '../../../lib/authStore';
// import { getAuth, signInWithCredential, PhoneAuthProvider } from 'firebase/auth';
// import { app } from '../../../lib/firebase';

// const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// // Define Firebase Error interface
// interface FirebaseError extends Error {
//   code: string;
//   message: string;
// }

// // Define backend response interface
// interface BackendVerificationResponse {
//   userId?: string;
//   riderId?: string;
//   name: string;
// }

// export default function VerifyForm() {
//   const router = useRouter();
//   const { confirmationResult, login, setIsLoading } = useAuthStore();

//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [role, setRole] = useState<'user' | 'rider'>('user');

//   useEffect(() => {
//     // Get stored data
//     const storedPhone = localStorage.getItem('phoneNumber');
//     const storedRole = localStorage.getItem('role');

//     if (storedPhone) setPhoneNumber(storedPhone);
//     if (storedRole) setRole(storedRole as 'user' | 'rider');

//     if (!confirmationResult) {
//       router.push('/auth/login');
//     }
//   }, [confirmationResult, router]);

//   const handleVerify = async () => {
//     if (!code || code.length < 6) {
//       setError('Please enter the 6-digit code');
//       return;
//     }

//     if (!confirmationResult) {
//       setError('Session expired. Please try again.');
//       router.push('/auth/login');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setIsLoading(true);

//     try {
//       const verificationId = localStorage.getItem('verificationId');

//       if (!verificationId) {
//         throw new Error('Verification ID not found');
//       }

//       // Verify OTP with Firebase
//       const auth = getAuth(app);
//       const credential = PhoneAuthProvider.credential(verificationId, code);
//       const result = await signInWithCredential(auth, credential);

//       console.log('✅ User signed in:', result.user.phoneNumber);

//       // Get user/rider data from backend
//       const userData = await verifyWithBackend(result.user.phoneNumber!, role);

//       if (userData) {
//         // Login successful
//         login({
//           uid: result.user.uid,
//           phoneNumber: result.user.phoneNumber!,
//           role: role,
//           userId: userData.userId ? Number(userData.userId) : undefined,
//           riderId: userData.riderId ? Number(userData.riderId) : undefined,
//           name: userData.name,
//         });

//         // Clear stored data
//         localStorage.removeItem('verificationId');
//         localStorage.removeItem('phoneNumber');
//         localStorage.removeItem('role');

//         // Redirect based on role
//         if (role === 'rider') {
//           router.push('/agents');
//         } else {
//           router.push('/dashboard');
//         }
//       } else {
//         throw new Error('User not found in database');
//       }
//     } catch (error) {
//       console.error('❌ Verification error:', error);
//       const firebaseError = error as FirebaseError;

//       if (firebaseError.code === 'auth/invalid-verification-code') {
//         setError('Invalid code. Please check and try again.');
//       } else if (firebaseError.code === 'auth/code-expired') {
//         setError('Code expired. Please request a new one.');
//       } else {
//         setError(firebaseError.message || 'Verification failed. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//       setIsLoading(false);
//     }
//   };

//   const verifyWithBackend = async (
//     phoneNumber: string,
//     role: 'user' | 'rider',
//   ): Promise<BackendVerificationResponse> => {
//     try {
//       const endpoint = role === 'rider' ? '/riders/verify-phone' : '/users/verify-phone';

//       const response = await fetch(`${baseUrl}${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ phoneNumber }),
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         throw new Error(data.message || 'User verification failed');
//       }

//       const data = await response.json();
//       return data.data;
//     } catch (error) {
//       console.error('Backend verification error:', error);
//       throw error;
//     }
//   };

//   const handleResendOTP = () => {
//     localStorage.removeItem('verificationId');
//     router.push('/auth/login');
//   };

//   return (
//     <AppLayout showHeader={true} showFooter={false} showSidebar={false}>
//       <div className="body-gradient flex min-h-screen items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="mb-8 text-center">
//             <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
//               <div className="h-8 w-8 rounded-lg bg-white"></div>
//             </div>
//             <h1 className="font-space-grotesk text-2xl font-bold text-white">Verify Your Phone</h1>
//             <p className="font-inter mt-2 text-gray-300">
//               Enter the 6-digit code sent to <br />
//               <span className="font-semibold">{phoneNumber}</span>
//             </p>
//           </div>

//           {/* Form Card */}
//           <div className="rounded-2xl bg-white p-6">
//             <div className="mb-6">
//               <h2 className="font-space-grotesk mb-4 text-lg font-semibold text-black">
//                 Verification Code
//               </h2>

//               {/* OTP Input */}
//               <div>
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={6}
//                   value={code}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/\D/g, '');
//                     setCode(value);
//                     setError('');
//                   }}
//                   disabled={loading}
//                   placeholder="000000"
//                   className="font-inter w-full rounded-lg border border-gray-300 py-3 text-center text-2xl tracking-widest transition-colors focus:border-green-500 focus:outline-none disabled:bg-gray-100"
//                 />
//               </div>

//               {/* Error Message */}
//               {error && (
//                 <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
//               )}

//               {/* Verify Button */}
//               <div className="mt-6">
//                 <button
//                   onClick={handleVerify}
//                   disabled={loading || code.length < 6}
//                   className="font-space-grotesk flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="h-5 w-5 animate-spin" />
//                       Verifying...
//                     </>
//                   ) : (
//                     'Verify & Sign In'
//                   )}
//                 </button>
//               </div>

//               {/* Resend Link */}
//               <div className="mt-4 text-center">
//                 <button
//                   onClick={handleResendOTP}
//                   disabled={loading}
//                   className="font-inter text-sm text-green-500 hover:underline disabled:text-gray-400"
//                 >
//                   Didn't receive code? Resend
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Trust Indicators */}
//           <div className="mt-8 flex items-center justify-center gap-8 text-center">
//             <div className="text-white">
//               <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
//                 <Check className="h-4 w-4 text-white" />
//               </div>
//               <p className="font-inter text-xs">Secure</p>
//             </div>
//             <div className="text-white">
//               <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
//                 <Check className="h-4 w-4 text-white" />
//               </div>
//               <p className="font-inter text-xs">Private</p>
//             </div>
//             <div className="text-white">
//               <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
//                 <Check className="h-4 w-4 text-white" />
//               </div>
//               <p className="font-inter text-xs">Fast</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// }
