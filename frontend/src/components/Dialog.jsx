export function Dialog({ open, onOpenChange, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50" onClick={onOpenChange}>
            <div className="bg-white rounded-lg p-6 w-[90%] md:w-[62%]  overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className }) {
    return <div className={className}>{children}</div>;
}

export function DialogHeader({ children }) {
    return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children, className }) {
    return <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>;
}
