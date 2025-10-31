import { RecaptchaVerifier, getAuth } from 'firebase/auth';
import { app } from './firebase';
import { FirebaseApp } from 'firebase/app';

export const setUpRecaptcha = (containerId = 'recaptcha-container') => {
  const auth = getAuth(app);
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response: FirebaseApp) => {
      console.log('reCAPTCHA verified:', response);
    },
  });

  return verifier;
};
