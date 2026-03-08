import React from 'react';

export const DonationSection: React.FC = () => {
  return (
    <div className="mt-6 pt-4 border-t border-zinc-800">
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4">
        <p className="text-amber-400 text-sm text-center font-medium mb-3">
          ☕ 如果觉得好用，打赏一杯咖啡吧！
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-zinc-400 text-xs mb-1">微信</p>
            <p className="text-white text-sm font-mono">Wirelesscharger</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-400 text-xs mb-1">或扫码</p>
            <img 
              src="/receiver2026.jpg" 
              alt="打赏二维码" 
              className="w-20 h-20 rounded-lg border border-zinc-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
