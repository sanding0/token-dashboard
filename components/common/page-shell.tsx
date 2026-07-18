import { cn } from "@/lib/utils"

export function PageShell({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-6",
                className,
            )}
        >
            {children}
        </div>
    )
}

export function PageHeader({
    title,
    description,
    action,
}: {
    title: string
    description?: string
    action?: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
                <h1 className="text-lg font-medium sm:text-xl">{title}</h1>
                {description ? (
                    <p className="text-sm text-muted-foreground text-pretty">{description}</p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    )
}
