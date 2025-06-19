/**
 * Table header for the student table.
 */
function StudentTableHeader() {
    return (
        <thead className="bg-blue-300 dark:bg-slate-700 sticky top-0 z-10">
            <tr>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Name</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Email</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Phone</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">CF Handle</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Current Rating</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Max Rating</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Last Updated</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Reminders Sent</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Auto Reminder</th>
                <th className="py-3 px-4 border-b font-semibold text-slate-900 dark:text-slate-100">Actions</th>
            </tr>
        </thead>
    );
}

export default StudentTableHeader;