import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBmodkFUiSLZUqLWp9ZiZhN9t_gCWNOhVs",
    authDomain: "bodipo-business.firebaseapp.com",
    projectId: "bodipo-business",
    storageBucket: "bodipo-business.firebasestorage.app",
    messagingSenderId: "627148996840",
    appId: "1:627148996840:web:585c48958d4fcb26ab895d",
    measurementId: "G-5K2V0GKSQ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export const isElectron = () => typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');

export const signInWithGoogle = async () => {
    if (isElectron()) {
        throw new Error("El inicio de sesión social (Google/Apple) no está disponible en la versión de escritorio por razones de seguridad de los proveedores. Por favor, usa tu correo y contraseña.");
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signInWithApple = async () => {
    if (isElectron()) {
        throw new Error("El inicio de sesión social (Google/Apple) no está disponible en la versión de escritorio por razones de seguridad de los proveedores. Por favor, usa tu correo y contraseña.");
    }
    try {
        const result = await signInWithPopup(auth, appleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Apple", error);
        throw error;
    }
};
