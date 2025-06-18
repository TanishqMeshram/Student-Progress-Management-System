function getColor(count) {
    if (!count) return "#e5e7eb";
    if (count >= 10) return "#1e40af";
    if (count >= 5) return "#2563eb";
    if (count >= 3) return "#3b82f6";
    return "#60a5fa";
}

export default function CustomHeatmap({ data, startDate, endDate, onCellClick }) {
    // data: [{ date: 'YYYY-MM-DD', count: N }, ...]
    // Build a map for quick lookup
    const dataMap = {};
    data.forEach(d => { dataMap[d.date] = d.count; });

    // Build days array
    const days = [];
    let current = new Date(startDate);
    const last = new Date(endDate);
    while (current <= last) {
        const dateStr = current.toISOString().slice(0, 10);
        days.push({ date: dateStr, count: dataMap[dateStr] || 0 });
        current.setDate(current.getDate() + 1);
    }

    // Group by week (7 days per row)
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
                                    background: getColor(day.count),
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    border: "1px solid #e5e7eb",
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