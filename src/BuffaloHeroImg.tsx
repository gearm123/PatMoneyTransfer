import { useState } from "react";

const FT = "/buffalo-hero-fintech.png";
const FALL = "/buffalo-hero.png";

/**
 * 3D fintech hero when `public/buffalo-hero-fintech.png` exists; otherwise previous photo.
 */
export function BuffaloHeroImg(props: { className?: string; width: number; height: number }) {
  const [src, setSrc] = useState(FT);
  return (
    <img
      className={props.className}
      src={src}
      onError={() => {
        if (src !== FALL) setSrc(FALL);
      }}
      alt="Buffalo"
      width={props.width}
      height={props.height}
      loading="eager"
      decoding="async"
    />
  );
}
