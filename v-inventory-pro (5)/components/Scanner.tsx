
import React, { useEffect } from 'react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    // @ts-ignore
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText: string) => {
        onScan(decodedText);
        html5QrCode.stop();
      },
      (errorMessage: string) => {
        // Ignorar errores de escaneo continuo
      }
    ).catch((err: any) => {
      console.error("Error al iniciar escáner:", err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800">Escanear Código</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="reader" className="w-full"></div>
        <div className="p-6 text-center text-slate-500 text-xs">
          Apunta la cámara al código de barras o QR del producto.
        </div>
      </div>
    </div>
  );
};

export default Scanner;
