const Logo = ({ ...props }) => (
  <div className="flex items-center space-x-3" {...props}>
    {/* MNNR Icon */}
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central square with dollar sign */}
      <rect x="37.5" y="37.5" width="25" height="25" fill="#10b981" rx="2"/>
      <text x="50" y="55" fontSize="16" fontWeight="bold" fill="#000" textAnchor="middle">$</text>
      
      {/* Connection nodes */}
      <circle cx="12.5" cy="12.5" r="4" fill="#10b981"/>
      <circle cx="87.5" cy="12.5" r="4" fill="#10b981"/>
      <circle cx="12.5" cy="87.5" r="4" fill="#10b981"/>
      <circle cx="87.5" cy="87.5" r="4" fill="#10b981"/>
      <circle cx="50" cy="5" r="4" fill="#10b981"/>
      <circle cx="5" cy="50" r="4" fill="#10b981"/>
      <circle cx="95" cy="50" r="4" fill="#10b981"/>
      <circle cx="50" cy="95" r="4" fill="#10b981"/>
      
      {/* Connection lines */}
      <line x1="16.5" y1="16.5" x2="37.5" y2="37.5" stroke="#10b981" strokeWidth="2"/>
      <line x1="83.5" y1="16.5" x2="62.5" y2="37.5" stroke="#10b981" strokeWidth="2"/>
      <line x1="16.5" y1="83.5" x2="37.5" y2="62.5" stroke="#10b981" strokeWidth="2"/>
      <line x1="83.5" y1="83.5" x2="62.5" y2="62.5" stroke="#10b981" strokeWidth="2"/>
      <line x1="50" y1="9" x2="50" y2="37.5" stroke="#10b981" strokeWidth="2"/>
      <line x1="9" y1="50" x2="37.5" y2="50" stroke="#10b981" strokeWidth="2"/>
      <line x1="91" y1="50" x2="62.5" y2="50" stroke="#10b981" strokeWidth="2"/>
      <line x1="50" y1="91" x2="50" y2="62.5" stroke="#10b981" strokeWidth="2"/>
    </svg>
    
    {/* MNNR Text */}
    <span className="text-xl font-light text-emerald-400 tracking-wider">MNNR</span>
  </div>
);

export default Logo;
