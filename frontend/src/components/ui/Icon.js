"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Briefcase,
  Building,
  Building2,
  Home,
  LayoutDashboard,
  Receipt,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Zap,
  Target,
  TrendingUp as GrowthIcon,
  Percent,
  Calculator,
  Archive,
  Bookmark,
  Tag,
  Layers,
  Database,
  Server,
  Cloud,
  Save,
  Copy,
  Trash2,
  Edit,
  Send,
  Inbox,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  Package,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Award,
  Users,
  UserPlus,
  UserCheck,
  UserX
} from 'lucide-react';

import { Icon as IconifyIcon } from '@iconify/react';

const iconMap = {
  // Financial
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'dollar': DollarSign,
  'wallet': Wallet,
  'credit-card': CreditCard,
  'pie-chart': PieChart,
  'bar-chart': BarChart3,
  'line-chart': LineChart,
  'activity': Activity,
  'growth': GrowthIcon,
  'percent': Percent,
  'calculator': Calculator,
  
  // Arrows & Directions
  'arrow-up-right': ArrowUpRight,
  'arrow-down-right': ArrowDownRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'minus': Minus,
  'plus': Plus,
  
  // Navigation
  'menu': Menu,
  'close': X,
  'home': Home,
  'dashboard': LayoutDashboard,
  'search': Search,
  'filter': Filter,
  'more': MoreVertical,
  
  // Actions
  'bell': Bell,
  'settings': Settings,
  'refresh': RefreshCw,
  'download': Download,
  'upload': Upload,
  'save': Save,
  'copy': Copy,
  'trash': Trash2,
  'edit': Edit,
  'send': Send,
  'share': Share2,
  'external-link': ExternalLink,
  
  // User
  'user': User,
  'users': Users,
  'user-plus': UserPlus,
  'user-check': UserCheck,
  'user-x': UserX,
  'logout': LogOut,
  
  // Status
  'check': Check,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  'info': Info,
  'help': HelpCircle,
  
  // Business
  'briefcase': Briefcase,
  'building': Building,
  'building-2': Building2,
  'receipt': Receipt,
  'file-text': FileText,
  'archive': Archive,
  'bookmark': Bookmark,
  'tag': Tag,
  'target': Target,
  'award': Award,
  
  // Time
  'calendar': Calendar,
  'clock': Clock,
  
  // Visibility
  'eye': Eye,
  'eye-off': EyeOff,
  
  // Security
  'lock': Lock,
  'unlock': Unlock,
  'shield': Shield,
  
  // Communication
  'mail': Mail,
  'phone': Phone,
  'inbox': Inbox,
  
  // Location
  'map-pin': MapPin,
  'globe': Globe,
  
  // Data
  'layers': Layers,
  'database': Database,
  'server': Server,
  'cloud': Cloud,
  
  // Files
  'folder-open': FolderOpen,
  'file': File,
  'image': Image,
  'video': Video,
  'music': Music,
  
  // Commerce
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  'package': Package,
  'gift': Gift,
  
  // Misc
  'star': Star,
  'heart': Heart,
  'zap': Zap,
};

export const Icon = ({ 
  name, 
  size = 20, 
  className = "", 
  strokeWidth = 2,
  color,
  ...props 
}) => {
  // Check if it's a Lucide icon
  const LucideIcon = iconMap[name];
  
  if (LucideIcon) {
    return (
      <LucideIcon 
        size={size} 
        className={className}
        strokeWidth={strokeWidth}
        color={color}
        {...props}
      />
    );
  }
  
  // Fallback to Iconify for other icon sets
  return (
    <IconifyIcon 
      icon={name} 
      width={size} 
      height={size}
      className={className}
      style={{ color }}
      {...props}
    />
  );
};

// Export individual icons for direct use
export {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  // ... add more exports as needed
};

// Iconify presets for common financial icons
export const IconifyPresets = {
  // Cryptocurrency
  bitcoin: 'cryptocurrency:btc',
  ethereum: 'cryptocurrency:eth',
  
  // Currencies
  rupee: 'mdi:currency-inr',
  euro: 'mdi:currency-euro',
  pound: 'mdi:currency-gbp',
  yen: 'mdi:currency-jpy',
  
  // Financial icons
  investment: 'mdi:chart-line',
  budget: 'mdi:calculator-variant',
  invoice: 'mdi:receipt',
  tax: 'mdi:percent-outline',
  payroll: 'mdi:account-cash',
  profit: 'mdi:cash-plus',
  loss: 'mdi:cash-minus',
  
  // Banks
  bank: 'mdi:bank',
  safe: 'mdi:safe',
  vault: 'mdi:lock-outline',
  
  // Charts
  candlestick: 'mdi:chart-candlestick',
  lineChart: 'mdi:chart-line',
  areaChart: 'mdi:chart-areaspline',
};
