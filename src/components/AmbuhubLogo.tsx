import Image from "next/image";

type AmbuhubLogoProps = {
  className?: string;
  /** Intrinsic width for Next/Image. Height follows the 3:2 source ratio. */
  width?: number;
  priority?: boolean;
};

/** Brand mark from `public/ambuhub-logo.png` (1536×1024). */
export function AmbuhubLogo({
  className = "h-auto w-full object-contain",
  width = 48,
  priority = false,
}: AmbuhubLogoProps) {
  const height = Math.round((width * 1024) / 1536);
  return (
    <Image
      src="/ambuhub-logo.png"
      alt="Ambuhub"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
