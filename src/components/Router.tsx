import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  // Normalize path from either window.location.pathname or window.location.hash
  const getNormalizedPath = () => {
    let currentPath = window.location.pathname;
    
    // Hash-based routing fallback to support static server deploys perfectly
    if (window.location.hash && window.location.hash.startsWith('#')) {
      currentPath = window.location.hash.substring(1);
    }
    
    // Extract base route if path contains sub-hash anchors (e.g., /#pricing-section)
    if (currentPath.includes('#')) {
      currentPath = currentPath.split('#')[0];
    }
    
    if (!currentPath.startsWith('/')) {
      currentPath = '/' + currentPath;
    }
    
    return currentPath;
  };

  const [path, setPath] = useState(getNormalizedPath());

  const scrollToHashElement = (target: string) => {
    let hash = '';
    if (target.includes('#')) {
      hash = target.split('#')[1];
    } else if (window.location.hash && !window.location.hash.includes('/') && window.location.hash.startsWith('#')) {
      hash = window.location.hash.substring(1);
    }

    if (hash) {
      let attempts = 0;
      const interval = setInterval(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          clearInterval(interval);
        } else {
          attempts++;
          if (attempts >= 15) { // Stop polling after 1.5s
            clearInterval(interval);
          }
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const norm = getNormalizedPath();
      setPath(norm);
      scrollToHashElement(window.location.hash || window.location.pathname);
    };

    // Listen for both popstate and hashchange to cover all router scenarios
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial load scroll check
    if (window.location.hash) {
      scrollToHashElement(window.location.hash);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    // If we want to use standard pathname routing
    if (to.startsWith('/')) {
      // Support hash-routing fallback automatically so it works in both contexts
      window.location.hash = to;
      window.history.pushState(null, '', '#' + to);
    } else {
      window.location.hash = to;
    }
    
    const baseRoute = to.includes('#') ? to.split('#')[0] : to;
    setPath(baseRoute || '/');
    scrollToHashElement(to);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function Link({ to, className, children, ...props }: { to: string; className?: string; children: React.ReactNode; [key: string]: any }) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={`#${to}`} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
