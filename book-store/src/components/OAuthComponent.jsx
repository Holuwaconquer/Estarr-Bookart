import React, { useEffect } from 'react';
import Google from '../assets/google.png';
import Facebook from '../assets/facebook.png';
import Apple from '../assets/apple.png';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';

const OAuthComponent = () => {
  const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!window.google || !GOOGLE_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_ID,
      callback: handleCredentialResponse,
    });
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const idToken = response.credential; // This is the JWT ID token

      try {
        const res = await api.userAPI.oauthGoogle(idToken);
        if (res && (res.data || res.success)) {
          toast.success('Login Successful!');
          setTimeout(() => window.location.assign('/'), 1200);
        } else {
          toast.error(res.message || 'Authentication failed');
        }
      } catch (err) {
        toast.error('Authentication failed');
        console.error(err);
      }
    } catch (err) {
      toast.error('Google OAuth failed');
      console.log('google error', err);
    }
  };

  const handleGoogleLogin = () => {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        toast.error('Google login prompt could not be displayed');
        console.warn(notification.getNotDisplayedReason());
      }
      if (notification.isSkippedMoment()) {
        console.warn('User skipped Google One Tap');
      }
      if (notification.isDismissedMoment()) {
        console.warn('User dismissed the Google One Tap');
      }
    });
  };

  // Updated Facebook login handler
  const handleFacebookLogin = () => {
    if (!window.FB) {
      toast.error('Facebook SDK not loaded yet.');
      return;
    }

    window.FB.login((response) => {
      (async () => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          try {
            try {
              const res = await api.userAPI.oauthFacebook(accessToken);
              if (res && (res.data || res.success)) {
                toast.success('Facebook login successful!');
                setTimeout(() => window.location.assign('/'), 1200);
              } else {
                toast.error(res.message || 'Facebook authentication failed');
              }
            } catch (err) {
              toast.error('Facebook OAuth failed');
              console.error('Facebook login error:', err);
            }
          } catch (err) {
            toast.error('Facebook OAuth failed');
            console.error('Facebook login error:', err);
          }
        } else {
          toast.error('Facebook login cancelled or failed');
        }
      })();
    }, { scope: 'email,public_profile' });
  };

  return (
    <div className='w-full grid grid-cols-3 gap-4'>
      <div
        onClick={handleGoogleLogin}
        className='w-full cursor-pointer hover:border-[#d112a5] transition-all border border-[#515DEF] rounded-[4px] py-[16px] px-[24px] flex justify-center items-center'
      >
        <img src={Google} alt='google' />
      </div>
      <div
        onClick={handleFacebookLogin}
        className='w-full cursor-pointer hover:border-[#d112a5] transition-all border border-[#515DEF] rounded-[4px] py-[16px] px-[24px] flex justify-center items-center'
      >
        <img src={Facebook} alt='facebook' />
      </div>
      <div className='w-full cursor-pointer hover:border-[#d112a5] transition-all border border-[#515DEF] rounded-[4px] py-[16px] px-[24px] flex justify-center items-center'>
        <img src={Apple} alt='apple' />
      </div>
      <ToastContainer />
    </div>
  );
};

export default OAuthComponent;
