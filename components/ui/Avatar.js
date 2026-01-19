'use client';

import Image from 'next/image';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

const Avatar = ({ 
  src, 
  alt = '', 
  name = '', 
  size = 'md',
  className = '' 
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div className={`relative rounded-full overflow-hidden ${sizes[size]} ${className}`}>
        <Image
          src={src}
          alt={alt || name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`
      flex items-center justify-center rounded-full
      bg-blue-600 text-white font-medium
      ${sizes[size]}
      ${className}
    `}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;
