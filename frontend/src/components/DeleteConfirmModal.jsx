import React from 'react';
import { motion } from 'framer-motion';

function DeleteConfirmModal({ student, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/10 z-50">
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-xl font-bold mb-4 text-red-600">Delete Confirmation</h2>
                <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{student.name}</span>?</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded transition-transform transform active:scale-95">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded transition-transform transform active:scale-95">Delete</button>
                </div>
            </motion.div>
        </div>
    );
}

export default DeleteConfirmModal;