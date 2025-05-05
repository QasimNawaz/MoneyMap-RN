import React, { createContext, useContext, useEffect, useState } from "react";
import { isOnboardingDone, isUserLoggedIn } from "../utils/storage";

const SplashContext = createContext();
export const useSplashContext = () => useContext(SplashContext);

const SplashProvider = ({ children }) => {
  const [isOnBoarded, setIsOnBoarded] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [splashLoading, setLoading] = useState(true);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const onboardingDone = await isOnboardingDone();
        const loggedIn = await isUserLoggedIn();
        setIsOnBoarded(onboardingDone);
        setIsLogged(loggedIn);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    prepareApp();
  }, [splashLoading]);

  return (
    <SplashContext.Provider
      value={{
        isOnBoarded,
        isLogged,
        setIsLogged,
        splashLoading,
      }}
    >
      {children}
    </SplashContext.Provider>
  );
};

export default SplashProvider;
