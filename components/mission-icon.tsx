import {
  Droplet,
  Dumbbell,
  BookOpen,
  Brain,
  PhoneOff,
  MessageCircle,
  Wallet,
  Activity,
  Library,
  PiggyBank,
  Users,
  Target,
  HeartPulse,
  Sparkles,
  Sunrise,
  Footprints,
  Apple,
  PenLine,
  type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  droplet: Droplet,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  brain: Brain,
  'phone-off': PhoneOff,
  'message-circle': MessageCircle,
  wallet: Wallet,
  activity: Activity,
  library: Library,
  'piggy-bank': PiggyBank,
  users: Users,
  target: Target,
  'heart-pulse': HeartPulse,
  sparkles: Sparkles,
  sunrise: Sunrise,
  footprints: Footprints,
  apple: Apple,
  'pen-line': PenLine,
}

export function MissionIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = MAP[name] ?? Target
  return <Icon className={className} />
}

export const ICON_OPTIONS = Object.keys(MAP)
