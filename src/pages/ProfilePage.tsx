import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { User, Shield, Key, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up font-sans pb-12">
      
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">Identity & Credentials</span>
        </div>
        <h2 className="text-xl font-display font-semibold text-white">Operator Profile</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Manage your personal developer account details, multi-factor tokens, and single sign-on linkages.</p>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-900/25 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white">Clerk Account Settings</h3>
          <p className="text-[11px] text-neutral-500 font-sans mt-0.5">Authorize secondary security keys and manage active browser login logs.</p>
        </div>

        <div className="border-t border-neutral-900 pt-6">
          <UserProfile 
            routing="hash"
            appearance={{
              variables: {
                colorPrimary: '#6366f1',
                colorBackground: '#0a0a0a',
                colorInputBackground: '#020202',
                colorText: '#ffffff',
                colorTextSecondary: '#a3a3a3',
                colorInputText: '#ffffff',
                colorBorder: '#171717',
              },
              elements: {
                card: 'bg-transparent border-0 shadow-none p-0 max-w-full w-full',
                navbar: 'hidden md:flex border-r border-neutral-900/60 mr-4 pr-4',
                headerTitle: 'text-white text-base font-display font-semibold',
                headerSubtitle: 'text-neutral-500 text-xs',
                profileSectionPrimaryButton: 'text-indigo-400 hover:text-indigo-300 font-semibold text-xs',
                userProfilePage__security: 'text-white',
                userPreviewId: 'text-neutral-500 font-mono text-[10px]',
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs px-4 py-2 cursor-pointer border-0 transition-colors',
                formButtonReset: 'text-neutral-400 hover:text-white text-xs cursor-pointer',
                breadcrumbsItem: 'text-neutral-400 font-semibold text-xs',
                breadcrumbsSeparator: 'text-neutral-600',
                badge: 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 text-[10px]',
                formFieldLabel: 'text-[10px] font-mono text-neutral-500 uppercase mb-1.5',
                formFieldInput: 'w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white focus:outline-none focus:border-indigo-500/60',
              }
            }}
          />
        </div>
      </div>

    </div>
  );
}
