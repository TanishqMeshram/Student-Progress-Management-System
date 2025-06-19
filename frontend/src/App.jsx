import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentTablePage from './pages/StudentTablePage';
import StudentProfilePage from './pages/StudentProfilePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StudentTablePage />} />
                <Route path="/student/:id" element={<StudentProfilePage />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </Router>
    );
}

export default App;