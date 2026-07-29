import React from 'react';
import { CommunicationChannel, CommunicationOutcome } from '../../types';
import {
  PhoneCall,
  Mail,
  MessageSquare,
  Send,
  Users,
  Video,
  MoreHorizontal,
  Instagram,
} from 'lucide-react';

interface ChannelBadgeProps {
  channel: CommunicationChannel;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({
  channel,
  showLabel = true,
  size = 'md',
}) => {
  const getChannelConfig = (ch: CommunicationChannel) => {
    switch (ch) {
      case 'WhatsApp':
        return {
          icon: MessageSquare,
          label: 'WhatsApp',
          bgColor: 'bg-emerald-950/60',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-800/40',
        };
      case 'email':
        return {
          icon: Mail,
          label: 'Email',
          bgColor: 'bg-sky-950/60',
          textColor: 'text-sky-400',
          borderColor: 'border-sky-800/40',
        };
      case 'telefonata':
        return {
          icon: PhoneCall,
          label: 'Telefonata',
          bgColor: 'bg-amber-950/60',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-800/40',
        };
      case 'Telegram':
        return {
          icon: Send,
          label: 'Telegram',
          bgColor: 'bg-blue-950/60',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-800/40',
        };
      case 'Instagram':
        return {
          icon: Instagram,
          label: 'Instagram',
          bgColor: 'bg-fuchsia-950/60',
          textColor: 'text-fuchsia-400',
          borderColor: 'border-fuchsia-800/40',
        };
      case 'incontro':
        return {
          icon: Users,
          label: 'Incontro',
          bgColor: 'bg-purple-950/60',
          textColor: 'text-purple-400',
          borderColor: 'border-purple-800/40',
        };
      case 'videochiamata':
        return {
          icon: Video,
          label: 'Videochiamata',
          bgColor: 'bg-indigo-950/60',
          textColor: 'text-indigo-400',
          borderColor: 'border-indigo-800/40',
        };
      case 'altro':
      default:
        return {
          icon: MoreHorizontal,
          label: 'Altro',
          bgColor: 'bg-zinc-800/60',
          textColor: 'text-zinc-300',
          borderColor: 'border-zinc-700/40',
        };
    }
  };

  const config = getChannelConfig(channel);
  const IconComponent = config.icon;

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} font-medium tracking-wide shadow-sm`}
    >
      <IconComponent className={iconSizes[size]} />
      {showLabel && <span className={textSizes[size]}>{config.label}</span>}
    </span>
  );
};

interface OutcomeBadgeProps {
  outcome: CommunicationOutcome;
}

export const OutcomeBadge: React.FC<OutcomeBadgeProps> = ({ outcome }) => {
  const getOutcomeConfig = (out: CommunicationOutcome) => {
    switch (out) {
      case 'positivo':
      case 'completato':
        return {
          label: out === 'positivo' ? 'Positivo' : 'Completato',
          bgColor: 'bg-emerald-950/60',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-800/50',
        };
      case 'in_attesa':
        return {
          label: 'In Attesa',
          bgColor: 'bg-amber-950/60',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-800/50',
        };
      case 'da_ricontattare':
        return {
          label: 'Da Ricontattare',
          bgColor: 'bg-sky-950/60',
          textColor: 'text-sky-400',
          borderColor: 'border-sky-800/50',
        };
      case 'nessuna_risposta':
        return {
          label: 'Nessuna Risposta',
          bgColor: 'bg-orange-950/60',
          textColor: 'text-orange-400',
          borderColor: 'border-orange-800/50',
        };
      case 'negativo':
        return {
          label: 'Negativo',
          bgColor: 'bg-rose-950/60',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-800/50',
        };
      default:
        return {
          label: outcome,
          bgColor: 'bg-zinc-800/60',
          textColor: 'text-zinc-300',
          borderColor: 'border-zinc-700/50',
        };
    }
  };

  const config = getOutcomeConfig(outcome);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} text-[11px] font-semibold uppercase tracking-wider`}
    >
      {config.label}
    </span>
  );
};
