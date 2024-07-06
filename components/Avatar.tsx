import { rings } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import Image from 'next/image';
import React from 'react';

function Avatar({ seed, className }: { seed: string; className?: string }) {
  // create an avatar using the seed file
  const avatar = createAvatar(rings, {
    seed,
    // ... other options
  });

  //get an svg image file
  const svg = avatar.toString();

  // convert into base64 string for dataUrl
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString(
    'base64',
  )}`;

  return (
    <Image
      src={dataUrl}
      alt="User Avatar"
      width={100}
      height={100}
      className={className}
    />
  );
}

export default Avatar;
