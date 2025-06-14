import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/10 z-50">
            <motion.div 
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl mb-4">{initialData ? 'Edit Student' : 'Add Student'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {['name', 'email', 'phone', 'cfHandle'].map(field => (
                        <div key={field}>
                            <input
                                type="text"
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field]}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    ))}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded transition-transform transform active:scale-95">Cancel</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded transition-transform transform active:scale-95">Save</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default StudentForm;
