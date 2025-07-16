export default function AppIcon({ size = 512 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid="app-icon"
    >
      <rect width="512" height="512" rx="100" fill="#6366f1"/>
      <path
        d="M256 128C185.3 128 128 185.3 128 256s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 208c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"
        fill="white"
      />
      <circle cx="256" cy="256" r="40" fill="white"/>
      <path
        d="M256 64v64M256 384v64M64 256h64M384 256h64"
        stroke="white"
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  );
}