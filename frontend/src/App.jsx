import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentTablePage from './pages/StudentTablePage';
import StudentProfilePage from './pages/StudentProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StudentTablePage />} />
                <Route path="/student/:id" element={<StudentProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;