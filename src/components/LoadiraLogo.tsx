function TruckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Trailer body */}
      <rect x="0" y="4" width="18" height="12" rx="1.5" fill="currentColor" opacity="0.9" />
      {/* Cab */}
      <path
        d="M18 8h6.5c1.1 0 2.1.6 2.6 1.5L29 13v3h-11V8z"
        fill="currentColor"
      />
      {/* Cab window */}
      <path
        d="M20 9.5h4.2c.7 0 1.3.4 1.6.9L27.2 13H20V9.5z"
        fill="#030712"
        opacity="0.6"
      />
      {/* Wheels */}
      <circle cx="7" cy="19" r="3" fill="currentColor" />
      <circle cx="7" cy="19" r="1.5" fill="#030712" />
      <circle cx="24" cy="19" r="3" fill="currentColor" />
      <circle cx="24" cy="19" r="1.5" fill="#030712" />
      {/* Undercarriage line */}
      <rect x="11" y="17.5" width="9" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

interface LoadiraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero'
}

const sizeConfig = {
  sm: { icon: 'w-6 h-[18px]', text: 'text-sm', gap: 'gap-1.5' },
  md: { icon: 'w-8 h-6', text: 'text-xl', gap: 'gap-2' },
  lg: { icon: 'w-9 h-[27px]', text: 'text-2xl', gap: 'gap-2.5' },
  hero: { icon: 'w-16 h-12', text: 'text-4xl', gap: 'gap-3' },
}

function LoadiraLogo({ size = 'md' }: LoadiraLogoProps) {
  const s = sizeConfig[size]

  return (
    <div className={`flex items-center ${s.gap}`}>
      <TruckIcon className={`${s.icon} text-orange-500`} />
      <span className={`${s.text} font-bold tracking-wider text-white uppercase`}>
        <span className="text-orange-500">L</span>OADIRA
      </span>
    </div>
  )
}

export default LoadiraLogo
