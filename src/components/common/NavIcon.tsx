import React from 'react';
import {
  LayoutDashboard,
  Users,
  User,
  Package,
  CreditCard,
  Euro,
  Clock,
  RefreshCw,
  CheckSquare,
  Calendar,
  FolderKanban,
  MessageSquare,
  BarChart3,
  UserCheck,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface NavIconProps {
  name: string;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'User':
      return <User className={className} />;
    case 'Package':
      return <Package className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Euro':
      return <Euro className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'RefreshCw':
      return <RefreshCw className={className} />;
    case 'CheckSquare':
      return <CheckSquare className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'FolderKanban':
      return <FolderKanban className={className} />;
    case 'MessageSquare':
      return <MessageSquare className={className} />;
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'UserCheck':
      return <UserCheck className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
