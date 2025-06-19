import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { extractErrorMessage } from '../utils/errorUtils';
import { toast } from 'react-toastify';

/**
 * StudentForm component for adding or editing a student.
 * @param {function} onClose - Close modal handler
 * @param {function} onSave - Save handler (add or update)
 * @param {Object} initialData - Initial student data for editing
 */
function StudentForm({ onClose, onSave, initialData }) {
    const [formData, setFormData] = useState(
        initialData || {
            name: '',
            email: '',
            phone: '',
            cfHandle: ''
        }
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate form when editing
    useEffect(() => {
        if (initialData) {
            const { name, email, phone, cfHandle } = initialData;
            setFormData({ name, email, phone, cfHandle });
        }
    }, [initialData]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Validate and submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.name.trim()) {
            setError('Name is required.');
            return;
        }
        if (!formData.cfHandle.trim()) {
            setError('Codeforces handle is required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!/^\d{10,}$/.test(formData.phone)) {
            setError('Please enter a valid phone number.');
            return;
        }
        setLoading(true);
        try {
            await onSave(formData);
            toast.success('Student saved successfully!');
            onClose();
        } catch (err) {
            const msg = extractErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-blue-50 to-green-50/80 dark:from-slate-900 dark:to-slate-800/80 z-50">
            <motion.div 
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-blue-400 dark:text-cyan-200 hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Close"
                >
                    <X size={28} />
                </button>
                <h2 className="text-2xl font-bold text-blue-600 dark:text-cyan-200 mb-6">{initialData ? 'Edit Student' : 'Add Student'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {['name', 'email', 'phone', 'cfHandle'].map(field => (
                        <div key={field}>
                            <input
                                type="text"
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field]}
                                onChange={handleChange}
                                className="w-full p-3 border border-blue-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 transition bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                required
                                disabled={loading}
                            />
                        </div>
                    ))}
                    {error && (
                        <div className="text-red-500 text-center">{error}</div>
                    )}
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-400 dark:bg-slate-700 hover:bg-gray-500 dark:hover:bg-slate-600 text-white px-5 py-2 rounded-lg transition cursor-pointer" disabled={loading}>Cancel</button>
                        <button type="submit" className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition cursor-pointer" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default StudentForm;
