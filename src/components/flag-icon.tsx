interface FlagIconProps {
  countryCode: string;
  className?: string;
}

export function FlagIcon({ countryCode, className = 'w-8 h-6' }: FlagIconProps) {
  // Using flagcdn.com for reliable flag images
  const flagUrl = `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;

  return (
    <img
      src={flagUrl}
      alt={`${countryCode} flag`}
      className={`rounded ${className} object-cover`}
      loading="lazy"
    />
  );
}
