import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

const avatarDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#7c3aed" />
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="48" fill="#0f172a" />
    <circle cx="48" cy="34" r="18" fill="#e2e8f0" />
    <rect x="18" y="58" width="60" height="24" rx="12" fill="url(#g)" />
  </svg>`,
)}`

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const WithImage = {
  render: () => (
    <Avatar className="size-16">
      <AvatarImage alt="Operator profile" src={avatarDataUrl} />
      <AvatarFallback>OP</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackOnly = {
  render: () => (
    <Avatar className="size-16">
      <AvatarFallback>DM</AvatarFallback>
    </Avatar>
  ),
}

export const TeamStack = {
  render: () => (
    <div className="flex items-center -space-x-3">
      <Avatar className="size-12 border-2 border-background">
        <AvatarImage alt="Operator one" src={avatarDataUrl} />
        <AvatarFallback>OP</AvatarFallback>
      </Avatar>
      <Avatar className="size-12 border-2 border-background">
        <AvatarFallback>DM</AvatarFallback>
      </Avatar>
      <Avatar className="size-12 border-2 border-background">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
    </div>
  ),
}
