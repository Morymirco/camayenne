export const getMarkerIcon = (type: string) => {
  switch (type) {
    case 'restaurant':
      return `
        <div style="
          background-color: #FF5252;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
        </div>
      `
    case 'hotel':
      return `
        <div style="
          background-color: #448AFF;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
          </svg>
        </div>
      `
    case 'pharmacie':
      return `
        <div style="
          background-color: #4CAF50;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
          </svg>
        </div>
      `
    case 'ecole':
      return `
        <div style="
          background-color: #FFC107;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M12 3L1 9l11 6l9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z"/>
          </svg>
        </div>
      `
    case 'banque':
      return `
        <div style="
          background-color: #9C27B0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M4 10h3v7H4v-7zm6.5-7L2 10v12h20V10L13.5 3zm8.5 16H6V9.9l7.5-5.5L21 9.9V19zm-1-8h-3v7h3v-7z"/>
          </svg>
        </div>
      `
    case 'magasin':
      return `
        <div style="
          background-color: #FF9800;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      `
    case 'cafe':
      return `
        <div style="
          background-color: #795548;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.76 7.29 3.95.12 7.24-3.06 7.24-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zM16 5v3H6V5h10zm2.5 3H18V5h.5c.83 0 1.5.67 1.5 1.5S19.33 8 18.5 8zM4 19h16v2H4v-2z"/>
          </svg>
        </div>
      `
    case 'hopital':
      return `
        <div style="
          background-color: #F44336;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
          </svg>
        </div>
      `
    default:
      return `
        <div style="
          background-color: #4A90E2;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        "></div>
      `
  }
} 