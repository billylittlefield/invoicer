import React, { Suspense } from 'react';
import { useImage } from 'react-image';

function Logo({ url }) {
  const { src } = useImage({
    srcList: url
  });

  return (
    <img
      src={src}
      style={{
        width: '6cm',
        height: '2cm',
        display: 'block'
      }}
    />
  );
}

export default function CompanyLogo({ url }) {
  return (
    <Suspense>
      <Logo url={url} />
    </Suspense>
  );
}
