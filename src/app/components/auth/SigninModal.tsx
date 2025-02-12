'use client';
import { signIn } from 'next-auth/react';

const GoogleIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
        <path
            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
            fill="#EA4335"
        />
        <path
            d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 16.0451 17.34 17.3350 16.12 18.2L19.93 21.2C22.1899 19.13 23.49 15.93 23.49 12.275Z"
            fill="#4285F4"
        />
        <path
            d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.70492L1.27498 6.60992C0.464981 8.22992 0 10.0599 0 11.9999C0 13.9399 0.464981 15.7699 1.27498 17.3899L5.26498 14.2949Z"
            fill="#FBBC05"
        />
        <path
            d="M12.0004 24C15.2354 24 17.9504 22.935 19.9304 21.2L16.1204 18.2C15.0804 18.935 13.7404 19.425 12.0004 19.425C8.87043 19.425 6.21542 17.315 5.27045 14.295L1.28045 17.39C3.25545 21.31 7.31045 24 12.0004 24Z"
            fill="#34A853"
        />
    </svg>
);

export default function SignInModal({ isOpen, onClose }) {
    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-display font-bold text-center mb-6 text-black">Welcome to SpaceLeet</h2>
                <button
                    onClick={() => signIn('google', { callbackUrl: '/session' })}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-200"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
