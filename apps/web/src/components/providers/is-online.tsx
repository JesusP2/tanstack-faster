import { createContext, useContext, useEffect, useState } from 'react';

type IsOnlineProviderProps = {
  children: React.ReactNode;
};

type IsOnlineProviderState = {
  isOnline: boolean;
};

const initialState: IsOnlineProviderState = {
  isOnline: navigator.onLine,
};

const IsOnlineProviderContext =
  createContext<IsOnlineProviderState>(initialState);

export function IsOnlineProvider({
  children,
  ...props
}: IsOnlineProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  function handleOnline() {
    setIsOnline(true);
  }

  function handleOffline() {
    setIsOnline(false);
  }

  useEffect(() => {
    const id = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 30_000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const value = {
    isOnline,
  };

  return (
    <IsOnlineProviderContext.Provider {...props} value={value}>
      {children}
    </IsOnlineProviderContext.Provider>
  );
}

export const useIsOnline = () => {
  const context = useContext(IsOnlineProviderContext);

  if (context === undefined)
    throw new Error('useIsOnline must be used within an IsOnlineProvider');

  return context;
};
