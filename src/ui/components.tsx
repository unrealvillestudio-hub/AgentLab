import React, { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const btnVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#FFAB00] text-[#050508] hover:bg-[#FFB800] font-semibold',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
  ghost: 'text-white/70 hover:text-white hover:bg-white/8',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30',
  outline: 'border border-[#FFAB00]/50 text-[#FFAB00] hover:bg-[#FFAB00]/10',
};

const btnSizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${btnVariantClasses[variant]} ${btnSizeClasses[size]} ${className}`}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
  accent?: string;
}

export function Card({ children, className = '', onClick, hover, accent, style }: CardProps) {
  const borderStyle: React.CSSProperties = accent ? { borderColor: `${accent}40`, ...style } : (style ?? {});
  return (
    <div
      onClick={onClick}
      style={borderStyle}
      className={`bg-white/4 border border-white/8 rounded-xl ${hover ? 'hover:bg-white/6 hover:border-white/14 cursor-pointer transition-all duration-150' : ''} ${className}`}
    >

      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'custom';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  color?: string;
  className?: string;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/70',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-500/20 text-blue-400',
  custom: '',
};

export function Badge({ children, variant = 'default', color, className = '' }: BadgeProps) {
  const style = color ? { backgroundColor: `${color}20`, color } : undefined;
  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${!color ? badgeVariantClasses[variant] : ''} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, hint, error, icon, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>}
        <input
          {...rest}
          className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFAB00]/60 focus:bg-white/7 transition-all ${icon ? 'pl-9' : ''} ${error ? 'border-red-500/50' : ''} ${className}`}
        />
      </div>
      {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = '', ...rest }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>}
      <textarea
        {...rest}
        className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFAB00]/60 focus:bg-white/7 transition-all resize-none ${error ? 'border-red-500/50' : ''} ${className}`}
      />
      {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  hint?: string;
}

export function Select({ label, options, hint, className = '', ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>}
      <select
        {...rest}
        className={`w-full bg-[#0a0a10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFAB00]/60 transition-all ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg', footer }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full ${width} bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/8">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
            {footer && <div className="px-6 pb-5 flex items-center justify-end gap-2">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 bg-white/4 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-[#FFAB00] text-[#050508]'
              : 'text-white/50 hover:text-white hover:bg-white/6'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  active: '#22C55E',
  draft: '#6B7280',
  testing: '#F59E0B',
  paused: '#EF4444',
  waiting: '#F59E0B',
  closed: '#6B7280',
  handoff: '#A855F7',
};

export function StatusDot({ status, label }: { status: string; label?: string }) {
  const color = statusColors[status] ?? '#6B7280';
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {status === 'active' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
      </span>
      {label && <span className="text-xs text-white/60">{label}</span>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-white/70 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/40 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  accent?: string;
}

export function SectionHeader({ title, subtitle, action, accent }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2
          className="font-display text-2xl font-bold text-white"
          style={accent ? { textShadow: `0 0 30px ${accent}40` } : undefined}
        >
          {title}
        </h2>
        {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all ${
        copied ? 'bg-green-500/20 text-green-400' : 'bg-white/8 text-white/60 hover:bg-white/12 hover:text-white'
      } ${className}`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          Copiado
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          Copiar
        </>
      )}
    </button>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
export function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  return (
    <div className="bg-black/40 rounded-lg border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/8">
        <span className="text-xs font-mono text-white/40">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-xs font-mono text-white/80 overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ label, value, sub, icon, color = '#FFAB00', trend }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        {trend && (
          <span className={`text-xs ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold font-mono mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-white/50">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
    </Card>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span
        className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-[#FFAB00]' : 'bg-white/20'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
      {label && <span className="text-sm text-white/70">{label}</span>}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-white/8 ${className}`} />;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
export function Tooltip({ children, tip }: { children: ReactNode; tip: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-[#1a1a2e] border border-white/10 text-xs text-white/80 whitespace-nowrap z-50 pointer-events-none"
          >
            {tip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
