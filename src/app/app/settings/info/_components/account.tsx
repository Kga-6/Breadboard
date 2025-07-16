"use client";


import { useAuth } from "@/app/context/AuthContext";  
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useEffect, useState } from "react";

import DisplayNameEdit from "../../_components/DisplayNameEdit"
import UsernameEdit from "../../_components/UsernameEdit"
import EmailEdit from "../../_components/EmailEdit"

export default function Account() {
  const { currentUser, userData, updateUserProfile, sendVerificationEmail, sendPasswordReset, linkGoogleAccount } = useAuth();

  const [displayName, setDisplayName] = useState<string | ''>(userData?.name || '');
  const [username, setUsername] = useState<string | ''>(userData?.username || '');
  const [email, setEmail] = useState<string | "">(currentUser?.email || '');

  const [showDisplayNameEdit, setShowDisplayNameEdit] = useState(false);
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [showEmailEdit, setShowEmailEdit] = useState(false);

  const [isLinking, setIsLinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [verificationMessage, setVerificationMessage] = useState('');

  const hasPasswordProvider = currentUser?.providerData.some(
    (provider) => provider.providerId === 'password'
  );

  const isGoogleLinked = currentUser?.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );

  const handleLinkGoogle = async () => {
    setIsLinking(true);
    setMessage(null);
    const result = await linkGoogleAccount();
    if (result.success) {
      setMessage({ type: 'success', text: result.msg || 'Account linked!' });
    } else {
      setMessage({ type: 'error', text: result.msg || 'Failed to link account.' });
    }
    setIsLinking(false);
  };


  // 3. Create a handler to send the verification email
  const handleSendVerification = async () => {
    // Reset message and disable button while sending
    setVerificationMessage('Sending...'); 
    try {
      await sendVerificationEmail();
      setVerificationMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      console.error("Failed to send verification email:", error);
      setVerificationMessage('Failed to send email. Please try again in a moment.');
    }
  };

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) {
      setMessage({ type: 'error', text: 'No email found for this user.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await sendPasswordReset(currentUser.email);
      setMessage({ type: 'success', text: 'Password reset email sent! Please check your inbox.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      // Account
      setDisplayName(userData.name || '');
      setUsername(userData.username || '');
      setEmail(userData.email || '');
    }
  }, [userData, message]);
  

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-black dark:text-white border-b-1 border-gray-200 pb-4 ">Account</h1>
      <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
        <div>
          <p className="text-[15px] font-medium mb-1">Display Name</p>
          <p className="text-[15px] ">{displayName}</p>
        </div>
        <DisplayNameEdit displayName={displayName} updateUserProfile={updateUserProfile} setShowDisplayNameEdit={setShowDisplayNameEdit} showDisplayNameEdit={showDisplayNameEdit} />
      </div>
      <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
        <div>
          <p className="text-[15px] font-medium mb-1">Username</p>
          <p className="text-[15px] ">{username}</p>
        </div>
        <UsernameEdit username={username} updateUserProfile={updateUserProfile} setShowUsernameEdit={setShowUsernameEdit} showUsernameEdit={showUsernameEdit} />
      </div>

      <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
        <div>
          <p className="text-[15px] font-medium mb-1">Email</p>
          <p className="text-[15px] ">{email}</p>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          {currentUser?.emailVerified === false ? (
              <Button onClick={handleSendVerification} variant="outline" className="w-24">
                Verify
              </Button>
          ) : (
              <div className="flex flex-row gap-2 justify-center items-center">
                <BadgeCheck style={{ width: '18px', height: '18px' }} className=" text-blue-300" />
                <span className="text-[15px] text-center text-gray-400  italic">Verified</span>
              </div>
          )}
          {hasPasswordProvider &&
            <EmailEdit email={email} updateUserProfile={updateUserProfile} setShowEmailEdit={setShowEmailEdit} showEmailEdit={showEmailEdit} />
          }
        </div>
      </div>
      

      {hasPasswordProvider && (
        <div className="flex flex-row justify-between items-center py-4 border-b-1 border-gray-200">
          <div>
            <p className="text-[15px] font-medium mb-1">Password</p>
            <p className="text-[15px] ">Receive a password reset email</p>
          </div>
          <Button onClick={handleSendResetEmail} variant="ghost"  disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2 justify-between py-4">
        <div>
          <p className="text-[15px] font-medium mb-1">Connected Accounts</p>
          <p className="text-sm text-gray-500">Link other services to your account.</p>
        </div>
        <div className="flex flex-row gap-2 mt-2">
          <Button 
            variant="outline" 
            className="w-36 h-[44px] justify-start gap-2 rounded-none"
            onClick={handleLinkGoogle}
            disabled={isGoogleLinked || isLinking}
          >
            <FaGoogle />
            {isLinking ? 'Linking...' : (isGoogleLinked ? 'Connected' : 'Connect Google')}
          </Button>
          {/* <Button variant="outline" className="w-36 justify-start gap-2" >
            <FaFacebook />
            Facebook
          </Button> */}
        </div>
      </div>

    </div>
  );
}