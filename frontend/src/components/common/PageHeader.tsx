import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-soc-panelBorder">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-soc-textPrimary flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-soc-textSecondary mt-1 font-mono">{description}</p>
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
};
