// api.js - Handles all API calls to the backend using axios

import axios from 'axios';

// Base API URL (can be configured via environment variable)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints
const STUDENTS_URL = `${API_BASE_URL}/students`;
const SYNC_URL = `${API_BASE_URL}/sync`;

// Student API calls
export const getStudents = () => axios.get(STUDENTS_URL);
export const addStudent = (student) => axios.post(STUDENTS_URL, student);
export const updateStudent = (id, student) => axios.put(`${STUDENTS_URL}/${id}`, student);
export const deleteStudent = (id) => axios.delete(`${STUDENTS_URL}/${id}`);
export const fetchStudentProgress = (id) => axios.get(`${STUDENTS_URL}/${id}/progress`);
export const getStudentById = (id) => axios.get(`${STUDENTS_URL}/${id}`);
export const getStudentContestData = (id, range) => axios.get(`${STUDENTS_URL}/${id}/contest-history?range=${range}`);
export const getStudentProblemData = (id, range = 30) => axios.get(`${STUDENTS_URL}/${id}/problem-solving-stats?range=${range}`);
export const toggleStudentReminder = (id) => axios.put(`${STUDENTS_URL}/${id}/toggle-reminder`);

// Cron job API calls
export const getCronTime = () => axios.get(`${SYNC_URL}/cron-time`);
export const updateCronTime = (newCronTime) => axios.post(`${SYNC_URL}/update-cron`, { newCronTime });
