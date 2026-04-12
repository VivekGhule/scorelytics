import React, { useState } from 'react';
import { createPortal } from 'react-dom';

type HoverZoomImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  previewWidthClassName?: string;
};

const HoverZoomImage: React.FC<HoverZoomImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  previewWidthClassName = 'max-w-[92vw]'
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const preview = (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden md:flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]" />
      <div
        className={`relative rounded-2xl border border-slate-300 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${previewWidthClassName}`}
      >
        <img
          src={src}
          alt={`${alt} (Zoomed)`}
          className="w-auto h-auto max-w-[88vw] max-h-[82vh] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`relative cursor-zoom-in ${className}`}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <img
          src={src}
          alt={alt}
          className={`transition-transform duration-200 hover:scale-[1.04] ${imgClassName}`}
          referrerPolicy="no-referrer"
        />
      </div>

      {showPreview && typeof document !== 'undefined' ? createPortal(preview, document.body) : null}
    </>
  );
};

export default HoverZoomImage;
