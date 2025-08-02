import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Your home.svg content
const shieldSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.405 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.081C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z" opacity=".5"/><path stroke-linecap="round" stroke-linejoin="round" d="m9.5 12.4l1.429 1.6l3.571-4"/></g></svg>
`;

export function ShieldIcon({ size = 24, color = '#000', strokeWidth = 2 }: IconProps) {
  // Replace currentColor and stroke-width with actual values
  const svgWithColor = shieldSvg
    .replace(/currentColor/g, color)
    .replace(/stroke-width="2"/g, `stroke-width="${strokeWidth}"`);

  return (
    <SvgXml 
      xml={svgWithColor} 
      width={size} 
      height={size} 
    />
  );
}