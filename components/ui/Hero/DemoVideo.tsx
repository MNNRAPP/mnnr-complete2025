'use client';

import { useState } from 'react';

interface DemoStep {
  time: string;
  title: string;
  description: string;
  code?: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    time: '0:00',
    title: 'Install SDK',
    description: 'Add MNNR to your project with npm or yarn',
    code: 'npm install @mnnr/sdk'
  },
  {
    time: '0:15',
    title: 'Initialize Client',
    description: 'Configure with your API key',
    code: `import { MNNR } from '@mnnr/sdk';
const mnnr = new MNNR({ apiKey: 'sk_...' });`
  },
  {
    time: '0:30',
    title: 'Track Usage',
    description: 'Record API calls, tokens, or any metric',
    code: `await mnnr.track('gpt-4-completion', {
  tokens: 1500,
  userId: 'user_123'
});`
  },
  {
    time: '0:45',
    title: 'View Analytics',
    description: 'Real-time dashboard with usage insights',
    code: '// Dashboard: https://app.mnnr.app/analytics'
  },
  {
    time: '1:00',
    title: 'Get Paid',
    description: 'Automatic billing via Stripe integration',
    code: '// Stripe webhook handles payments automatically'
  }
];

function PlayButton({ onClick, isPlaying }: { onClick: () => void; isPlaying: boolean }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-ping opacity-30" />
      {isPlaying ? (
        <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

function ProgressBar({ progress, steps }: { progress: number; steps: DemoStep[] }) {
  return (
    <div className="relative">
      {/* Background track */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step markers */}
      <div className="absolute top-0 left-0 right-0 flex justify-between">
        {steps.map((step, i) => {
          const stepProgress = (i / (steps.length - 1)) * 100;
          const isActive = progress >= stepProgress;
          return (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full -mt-1 transition-all duration-300 ${
                isActive ? 'bg-emerald-500 scale-125' : 'bg-white/20'
              }`}
              title={step.title}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handlePlay = () => {
    setShowModal(true);
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    
    // Simulate video progress
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const newProgress = (step / (DEMO_STEPS.length * 20)) * 100;
      setProgress(Math.min(newProgress, 100));
      setCurrentStep(Math.min(Math.floor(step / 20), DEMO_STEPS.length - 1));
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 50);
  };

  const handleClose = () => {
    setShowModal(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
  };

  return (
    <>
      {/* Demo Video Card */}
      <div className="relative group cursor-pointer" onClick={handlePlay}>
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card */}
        <div className="relative bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl overflow-hidden">
          {/* Video thumbnail area */}
          <div className="aspect-video relative bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 flex items-center justify-center">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.3) 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }} />
            </div>
            
            {/* Floating code snippets */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-left transform -rotate-2 opacity-60">
              <code className="text-xs text-emerald-400 font-mono">npm install @mnnr/sdk</code>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-left transform rotate-2 opacity-60">
              <code className="text-xs text-cyan-400 font-mono">mnnr.track(&apos;usage&apos;, ...)</code>
            </div>
            
            {/* Play button */}
            <PlayButton onClick={handlePlay} isPlaying={false} />
            
            {/* Duration badge */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/80 font-medium">
              1:00
            </div>
          </div>
          
          {/* Info bar */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">5-Minute Integration Demo</h3>
                <p className="text-white/50 text-sm mt-0.5">See how easy it is to get started</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <span>Watch now</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Video container */}
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/10">
              {/* Video area */}
              <div className="aspect-video relative bg-black flex items-center justify-center">
                {/* Current step visualization */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                      <span className="text-emerald-400 text-sm font-mono">{DEMO_STEPS[currentStep].time}</span>
                      <h3 className="text-3xl font-bold text-white mt-2">{DEMO_STEPS[currentStep].title}</h3>
                      <p className="text-white/60 mt-2">{DEMO_STEPS[currentStep].description}</p>
                    </div>
                    
                    {DEMO_STEPS[currentStep].code && (
                      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <pre className="text-sm font-mono text-emerald-400 overflow-x-auto">
                          {DEMO_STEPS[currentStep].code}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                  <PlayButton onClick={() => setIsPlaying(!isPlaying)} isPlaying={isPlaying} />
                </div>
              </div>
              
              {/* Controls */}
              <div className="p-4 border-t border-white/5">
                <ProgressBar progress={progress} steps={DEMO_STEPS} />
                
                {/* Step indicators */}
                <div className="flex justify-between mt-4">
                  {DEMO_STEPS.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentStep(i);
                        setProgress((i / (DEMO_STEPS.length - 1)) * 100);
                      }}
                      className={`text-xs transition-colors ${
                        currentStep === i ? 'text-emerald-400' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {step.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
