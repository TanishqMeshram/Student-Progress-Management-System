import StudentTableHeader from './StudentTableHeader';
import StudentRow from './StudentRow';

/**
 * StudentTable
 * Renders the student table with header and rows.
 */
function StudentTable({
    students,
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
    return (
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white dark:bg-slate-800">
            <div className="min-w-full">
                <table className="min-w-full text-sm md:text-base table-fixed">
                    <StudentTableHeader />
                    <tbody>
                        {students.map(student => (
                            <StudentRow
                                key={student._id}
                                student={student}
                                isInactive={isInactive}
                                toggleReminder={toggleReminder}
                                setSelectedStudent={setSelectedStudent}
                                setShowModal={setShowModal}
                                setStudentToDelete={setStudentToDelete}
                                setShowDeleteModal={setShowDeleteModal}
                                setProgressStudent={setProgressStudent}
                                setShowProgressModal={setShowProgressModal}
                                setLoading={setLoading}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StudentTable;