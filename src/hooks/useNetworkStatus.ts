import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Initial update
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

export const isSlowConnection = (networkStatus: NetworkStatus): boolean => {
  if (!networkStatus.isOnline) return true;
  
  // Consider slow if effective type is 2g or slow-2g
  if (networkStatus.effectiveType === '2g' || networkStatus.effectiveType === 'slow-2g') {
    return true;
  }
  
  // Consider slow if downlink is less than 1 Mbps
  if (networkStatus.downlink && networkStatus.downlink < 1) {
    return true;
  }
  
  // Consider slow if RTT is greater than 2000ms
  if (networkStatus.rtt && networkStatus.rtt > 2000) {
    return true;
  }
  
  return false;
};