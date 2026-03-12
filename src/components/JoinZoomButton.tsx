
import React from 'react';
import { Video } from 'lucide-react';

interface JoinZoomButtonProps {
  joinUrl: string;
  className?: string;
}

export const JoinZoomButton: React.FC<JoinZoomButtonProps> = ({ joinUrl, className = "" }) => {
  if (!joinUrl) return null;

  return (
    <a
      href={joinUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm ${className}`}
    >
      <Video size={18} />
      Join Zoom Meeting
    </a>
  );
};
