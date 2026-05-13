interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: Props) {
  return (
    <div className="bg-white border-b border-stone-100 px-4 pt-12 pb-4">
      <div className="max-w-md mx-auto">
        {icon && <div className="mb-2 text-amber-800">{icon}</div>}
        <h1 className="text-xl font-bold text-stone-800 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
