import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students'; // Adjust if needed

export const getStudents = () => axios.get(API_URL);
export const addStudent = (student) => axios.post(API_URL, student);
export const updateStudent = (id, student) => axios.put(`${API_URL}/${id}`, student);
export const deleteStudent = (id) => axios.delete(`${API_URL}/${id}`);
export const fetchStudentProgress = (id) => axios.get(`${API_URL}/${id}/progress`);
export const getStudentById = (id) => axios.get(`${API_URL}/${id}`);
export const getStudentContestData = (id, range) => axios.get(`${API_URL}/${id}/contest-history?range=${range}`);
export const getStudentProblemData = (id, range = 30) => axios.get(`${API_URL}/${id}/problem-solving-stats?range=${range}`);
export const toggleStudentReminder = async (id) => { await axios.put(`${API_URL}/${id}/toggle-reminder`)};