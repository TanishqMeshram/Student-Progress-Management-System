import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

function StudentForm({ onClose, onSave, initialData }) {
    const [formData, setFormData] = useState(
        initialData || {
            name: '',
            email: '',
            phone: '',
            cfHandle: ''
        }
    );

    useEffect(() => {
        if (initialData) {
            // Prevent rating fields from being shown or edited
            const { name, email, phone, cfHandle } = initialData;
            setFormData({ name, email, phone, cfHandle });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-blue-50 to-green-50/80 z-50">
            <motion.div 
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white border border-blue-200 p-8 rounded-2xl shadow-2xl w-full max-w-md relative"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition cursor-pointer rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Close"
                >
                    <X size={28} />
                </button>
                <h2 className="text-2xl font-bold text-blue-600 mb-6">{initialData ? 'Edit Student' : 'Add Student'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {['name', 'email', 'phone', 'cfHandle'].map(field => (
                        <div key={field}>
                            <input
                                type="text"
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field]}
                                onChange={handleChange}
                                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                required
                            />
                        </div>
                    ))}
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition">Cancel</button>
                        <button type="submit" className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-5 py-2 rounded-lg shadow transition">Save</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default StudentForm;
