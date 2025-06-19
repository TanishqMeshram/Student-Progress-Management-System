import { Pencil, Trash2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Returns a color class for a given Codeforces rating.
 */
function getRatingColor(rating) {
    if (rating >= 2600) return 'text-[#fe0000]';
    if (rating >= 2400) return 'text-[#ff0000]';
    if (rating >= 2100) return 'text-[#ff8c00]';
    if (rating >= 1900) return 'text-[#aa00aa]';
    if (rating >= 1600) return 'text-[#0000ff]';
    if (rating >= 1400) return 'text-[#03A89E]';
    if (rating >= 1200) return 'text-[#008000]';
    return 'text-gray-500';
}

/**
 * StudentRow
 * Renders a single student row in the table.
 */
function StudentRow({
    student,
    isInactive,
    toggleReminder,
    setSelectedStudent,
    setShowModal,
    setStudentToDelete,
    setShowDeleteModal,
    setProgressStudent,
    setShowProgressModal,
    setLoading
}) {
    const navigate = useNavigate();

    return (
        <tr
            className={`transition-all duration-200 ${
                isInactive(student)
                    ? 'hover:bg-red-100 dark:hover:bg-red-900'
                    : 'hover:bg-blue-100 dark:hover:bg-slate-700'
            } ${isInactive(student) ? 'bg-red-100 dark:bg-red-900' : 'dark:bg-slate-800'} cursor-pointer hover:shadow-lg hover:-translate-y-1`}
            style={{
                transition: 'background 0.2s, box-shadow 0.2s, transform 0.18s',
                willChange: 'transform',
            }}
            onClick={() => navigate(`/student/${student._id}`)}
        >
            <td className="py-2 px-4 border-b truncate max-w-[180px] text-slate-900 dark:text-slate-100">{student.name}</td>
            <td className="py-2 px-4 border-b truncate max-w-[200px] text-slate-900 dark:text-slate-100">{student.email}</td>
            <td className="py-2 px-4 border-b truncate max-w-[120px] text-slate-900 dark:text-slate-100">{student.phone}</td>
            <td className="py-2 px-4 border-b">
                <span
                    className={
                        `bg-blue-100 dark:bg-slate-700 px-2 py-1 rounded font-mono truncate max-w-[120px] inline-block relative group ` +
                        getRatingColor(student.currentRating)
                    }
                    tabIndex={0}
                >
                    {student.currentRating >= 3000 ? (
                        <>
                            <span className="text-black">{student.cfHandle.charAt(0)}</span>
                            <span className="text-[#fe0000]">{student.cfHandle.slice(1)}</span>
                        </>
                    ) : (
                        student.cfHandle
                    )}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity duration-200 z-20
                        bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {student.cfHandle}
                    </span>
                </span>
            </td>
            <td className="py-2 px-4 border-b text-slate-900 dark:text-slate-100">{student.currentRating}</td>
            <td className="py-2 px-4 border-b text-slate-900 dark:text-slate-100">{student.maxRating}</td>
            <td className="py-2 px-4 border-b truncate max-w-[160px] text-slate-900 dark:text-slate-100">{new Date(student.lastUpdated).toLocaleString()}</td>
            <td className="py-2 px-4 border-b text-slate-900 dark:text-slate-100">{student.remindersSent}</td>
            <td className="py-2 px-4 border-b" onClick={e => e.stopPropagation()}>
                <button
                    onClick={() => toggleReminder(student._id)}
                    className={`px-3 py-1 rounded-full font-semibold shadow transition cursor-pointer ${
                        student.autoReminderEnabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={student.autoReminderEnabled ? 'Disable Auto Reminder' : 'Enable Auto Reminder'}
                >
                    {student.autoReminderEnabled ? 'Enabled' : 'Disabled'}
                </button>
            </td>
            <td className="py-2 px-4 border-b">
                <div className="flex gap-2 justify-center" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => { setSelectedStudent(student); setShowModal(true); }}
                        className="p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900 transition cursor-pointer"
                        title="Edit"
                    >
                        <Pencil size={18} className="text-yellow-500" />
                    </button>
                    <button
                        onClick={() => { setStudentToDelete(student); setShowDeleteModal(true); }}
                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition cursor-pointer"
                        title="Delete"
                    >
                        <Trash2 size={18} className="text-red-500" />
                    </button>
                    <button
                        onClick={() => { setProgressStudent(student); setShowProgressModal(true); setLoading(true); }}
                        className="p-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 transition cursor-pointer"
                        title="More Details"
                    >
                        <Info size={20} className="text-blue-500" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default StudentRow;