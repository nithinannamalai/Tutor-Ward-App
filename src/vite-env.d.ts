/// <reference types="vite/client" />

declare module '@capacitor/app' {
  export const App: {
    addListener: (eventName: string, listenerFunc: (state: any) => void) => any;
    removeAllListeners: () => Promise<void>;
    exitApp: () => Promise<void>;
  };
}
