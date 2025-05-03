import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function SolanaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('glossy-icon', props.className)} // Apply glossy effect class
      {...props}
    >
      {/* Basic Solana-like shape - replace with actual glossy icon SVG */}
      <defs>
        <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 1 }} />
        </linearGradient>
         <filter id="gloss" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feOffset dy="-2" result="offsetBlur"/>
          <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#ffffff" result="specOut">
            <fePointLight x="-5000" y="-10000" z="20000"/>
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
        </filter>
      </defs>
       <path
         d="M6 18.5l4-13 4 13M10 18.5l4-13 4 13M14 18.5l4-13 4 13M6 5.5l4 13 4-13M10 5.5l4 13 4-13"
         stroke="url(#solanaGradient)"
         filter="url(#gloss)"
      />

      {/* Add more elements for a better representation if needed */}
    </svg>
  );
}
