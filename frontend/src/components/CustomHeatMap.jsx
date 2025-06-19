/**
 * Returns a color for a heatmap cell based on submission count and theme.
 */
function getColor(count, isDark) {
    if (!count) return isDark ? "#1e293b" : "#e5e7eb";
    if (count >= 10) return isDark ? "#2563eb" : "#1e40af";
    if (count >= 5) return isDark ? "#3b82f6" : "#2563eb";
    if (count >= 3) return isDark ? "#60a5fa" : "#3b82f6";
    return isDark ? "#bae6fd" : "#60a5fa";
}

/**
 * CustomHeatmap
 * Renders a calendar-style heatmap for submission activity.
 */
export default function CustomHeatmap({ data, startDate, endDate, onCellClick }) {
    const isDark = document.documentElement.classList.contains('dark');
    const dataMap = {};
    data.forEach(d => { dataMap[d.date] = d.count; });

    // Build days array for the range
    const days = [];
    let current = new Date(startDate);
    const last = new Date(endDate);
    while (current <= last) {
        const dateStr = current.toISOString().slice(0, 10);
        days.push({ date: dateStr, count: dataMap[dateStr] || 0 });
        current.setDate(current.getDate() + 1);
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className="overflow-x-auto">
            <div style={{ display: "flex", gap: 2 }}>
                {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {week.map((day, di) => (
                            <div
                                key={di}
                                title={`${day.date}: ${day.count} submissions`}
                                style={{
                                    width: 18,
                                    height: 18,
                                    background: getColor(day.count, isDark),
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    border: isDark ? "1px solid #334155" : "1px solid #e5e7eb",
                                }}
                                onClick={() => onCellClick && onCellClick(day)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}