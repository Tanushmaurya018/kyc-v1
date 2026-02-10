interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({
  title,
  description,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </header>
  );
}
