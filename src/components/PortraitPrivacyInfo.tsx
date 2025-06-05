
import React from 'react';
import { Shield } from 'lucide-react';

const PortraitPrivacyInfo: React.FC = () => {
  return (
    <div className="mt-4 pt-4 border-t border-lumi-sunset-coral/10">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="w-4 h-4 text-lumi-aquamarine" />
        <span className="text-white/80 text-sm">privacy protection</span>
      </div>
      <ul className="text-white/60 text-xs space-y-1">
        <li>• your psychological portrait is private and encrypted</li>
        <li>• only you can view or export your psychological data</li>
        <li>• data is stored securely and never shared with third parties</li>
        <li>• you can reset or delete your portrait at any time</li>
      </ul>
    </div>
  );
};

export default PortraitPrivacyInfo;
