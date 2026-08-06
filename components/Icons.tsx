import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 18, children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

export function CalendarIcon(props: IconProps) { return <IconBase {...props}><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="17" rx="2"/></IconBase>; }
export function ChevronLeftIcon(props: IconProps) { return <IconBase {...props}><path d="m15 18-6-6 6-6"/></IconBase>; }
export function ChevronRightIcon(props: IconProps) { return <IconBase {...props}><path d="m9 18 6-6-6-6"/></IconBase>; }
export function ClockIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></IconBase>; }
export function CheckIcon(props: IconProps) { return <IconBase {...props}><path d="m5 12 4 4L19 6"/></IconBase>; }
export function XIcon(props: IconProps) { return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18"/></IconBase>; }
export function ArrowRightIcon(props: IconProps) { return <IconBase {...props}><path d="M5 12h14M13 6l6 6-6 6"/></IconBase>; }
export function LanguageIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.7 5.5 3.7 9S14.4 18.5 12 21M12 3C9.6 5.5 8.3 8.5 8.3 12s1.3 6.5 3.7 9"/></IconBase>; }
export function EditIcon(props: IconProps) { return <IconBase {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></IconBase>; }
export function ListIcon(props: IconProps) { return <IconBase {...props}><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></IconBase>; }
export function DashboardIcon(props: IconProps) { return <IconBase {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></IconBase>; }
export function CourtIcon(props: IconProps) { return <IconBase {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18M7 4v4M17 16v4"/></IconBase>; }
export function BlockIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/></IconBase>; }
export function CheckInIcon(props: IconProps) { return <IconBase {...props}><path d="M4 4h10v16H4z"/><path d="M14 12h7M18 8l4 4-4 4"/></IconBase>; }
export function UsersIcon(props: IconProps) { return <IconBase {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></IconBase>; }
export function SettingsIcon(props: IconProps) { return <IconBase {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.37.2.72.43 1 .74.28.3.46.69.5 1.1V11h.1v4h-.1a1.7 1.7 0 0 0-1.5 0Z"/></IconBase>; }
export function CreditCardIcon(props: IconProps) { return <IconBase {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></IconBase>; }
export function SearchIcon(props: IconProps) { return <IconBase {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></IconBase>; }
export function PlusIcon(props: IconProps) { return <IconBase {...props}><path d="M12 5v14M5 12h14"/></IconBase>; }
export function TrashIcon(props: IconProps) { return <IconBase {...props}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></IconBase>; }
export function HomeIcon(props: IconProps) { return <IconBase {...props}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></IconBase>; }
export function LogOutIcon(props: IconProps) { return <IconBase {...props}><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5"/></IconBase>; }
export function MoneyIcon(props: IconProps) { return <IconBase {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 9h.01M17 15h.01"/></IconBase>; }
export function FacebookIcon(props: IconProps) { return <IconBase {...props}><path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"/></IconBase>; }
export function InstagramIcon(props: IconProps) { return <IconBase {...props}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></IconBase>; }
export function TelegramIcon(props: IconProps) { return <IconBase {...props}><path d="m21 4-7.5 16-3.6-6.1L4 10.5 21 4Z"/><path d="m9.9 13.9 4.3-4"/></IconBase>; }
export function PhoneIcon(props: IconProps) { return <IconBase {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z"/></IconBase>; }
export function MapPinIcon(props: IconProps) { return <IconBase {...props}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></IconBase>; }
export function DownloadIcon(props: IconProps) { return <IconBase {...props}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></IconBase>; }
