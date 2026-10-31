import React from 'react'

// Logo do Bê-a-bá da Grana: uma moeda com "A" sobre um caderno aberto (aprender + dinheiro).
// Mesmo desenho de SiteV2/src/components/BrandMark.jsx (Cashflow).
export function BrandMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden={true}>
      <rect width="64" height="64" rx="16" fill="#1F7A5A" />
      <path d="M10 37c7-2.4 14.5-1.8 22 2.2v14.6c-7.5-4-15-4.6-22-2.2z" fill="#FFF8E6" />
      <path d="M54 37c-7-2.4-14.5-1.8-22 2.2v14.6c7.5-4 15-4.6 22-2.2z" fill="#F3E8CC" />
      <path d="M32 39.2v14.6" stroke="#155A42" strokeWidth="1.6" />
      <path d="M15 42.5c4-.9 8-.6 12 .9M15 46.5c4-.9 8-.6 12 .9M37 43.4c4-1.5 8-1.8 12-.9M37 47.4c4-1.5 8-1.8 12-.9" stroke="#C9B98F" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="22" r="13" fill="#F2C14E" />
      <circle cx="32" cy="22" r="9.6" fill="none" stroke="#D99A1E" strokeWidth="2" />
      <path d="M28.2 25.6l3.8-9.4 3.8 9.4M29.6 22.4h4.8" stroke="#A86F0C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
