import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl shadow-sm ${className}`}
      {...props}
    >
      {(title || subtitle || action || Icon) && (
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB]">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>}
              {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
}

