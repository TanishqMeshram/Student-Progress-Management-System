import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ContestHistory from '../components/ContestHistory';
import ProblemSolvingStats from '../components/ProblemSolvingStats';
import { getStudentById } from '../api/api';

function StudentProfilePage() {
    const { id } = useParams(); // Get the student ID from URL
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudent() {
            try {
                const res = await getStudentById(id);
                setStudent(res.data);
            } catch (err) {
                console.error('Error fetching student', err);
            } finally {
                setLoading(false);
            }
        }
        fetchStudent();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-10">Loading student...</div>;
    }

    if (!student) {
        return <div className="text-center mt-10 text-red-500">Student not found.</div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Student Profile: {student.name}</h1>
            <div className="space-y-8">
                <ContestHistory id={id} />
                <ProblemSolvingStats id={id} />
            </div>
        </div>
    );
}

export default StudentProfilePage;
