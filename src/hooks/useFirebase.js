import axios from "axios";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import initializeAuthentication from "../Pages/Login/Firebase/firebase.init";

initializeAuthentication();

const useFirebase = () => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  // auth and provider
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // google sign in
  const signInWithGoogle = (location, history) => {
    setIsLoading(true);
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        setUser(result.user);
        // save user to database
        upsertUser(result?.user?.email, result?.user?.displayName);

        toast.success("Logged In Successfully");
        const destination = location?.state?.from || "/";
        history.replace(destination);
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  //   register new user
  const handleEmailRegister = (name, email, password, history) => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        setUser(result.user);
        // save user to database
        saveUser(email, name);

        updateProfile(auth.currentUser, {
          displayName: name,
        })
          .then(() => {
            toast.success("Registered Successfully");
            history.replace("/");
          })
          .catch((error) => {
            toast.error(error.message);
          });
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => setIsLoading(false));
  };
  // email login
  const handleEmailLogin = (email, password, location, history) => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        setUser(result.user);
        toast.success("Logged In Successfully");
        const destination = location?.state?.from || "/";
        history.replace(destination);
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => setIsLoading(false));
  };
  // password reset
  const handlePasswordReset = (email) => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.info("Password reset email sent");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };
  // log out
  const logOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("Logout Successfully");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  // observe user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser({});
      }
      setIsLoading(false);
    });
    return () => unsubscribe;
  }, [auth]);

  // save user to database
  const saveUser = (email, displayName) => {
    const user = { email, displayName };
    axios
      .post("https://afternoon-tor-94038.herokuapp.com/users", user)
      .then((result) => {});
  };

  const upsertUser = (email, displayName) => {
    const user = { email, displayName };
    axios
      .put("https://afternoon-tor-94038.herokuapp.com/users", user)
      .then((result) => {});
  };

  // admin check
  useEffect(() => {
    axios
      .get(`https://afternoon-tor-94038.herokuapp.com/users/${user?.email}`)
      .then((result) => {
        setAdmin(result.data?.admin);
      });
  }, [user?.email]);

  return {
    handleEmailRegister,
    handleEmailLogin,
    user,
    isLoading,
    handlePasswordReset,
    signInWithGoogle,
    logOut,
    admin,
  };
};

export default useFirebase;
