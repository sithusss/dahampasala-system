"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

import Header from '../components/Header';
import Footer from '../components/Footer';
import ViewModal from '../components/ViewModal';
import EditModal from '../components/EditModal';
import LeaveConfirmModal from '../components/LeaveConfirmModal';


export default function DetailsPage() {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [lang, setLang] = useState('si');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  
  // State Management සඳහා අලුතින් එක් කළ කොටස්
  const [students, setStudents] = useState([]); // සැබෑ සිසුන් ලැයිස්තුව
  const [activeStudent, setActiveStudent] = useState(null);
  const [loading, setLoading] = useState(true);

 // 1. Firebase එකෙන් දත්ත Real-time ගෙන ඒම
  useEffect(() => {

    console.log("--- Firebase Test Start ---");

    const q = query(
      collection(db, "students"), 
      where("admittedGrade", "in", [Number(selectedGrade), selectedGrade.toString()])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
    
        console.log("Firebase connection status: Active");
        console.log("Documents found:", snapshot.size);
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(studentList);
      setLoading(false); // දත්ත ලැබුණු පසු loading අයින් කරන්න
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedGrade]);

  // 2. ශිෂ්‍යයා ඉවත් කිරීමේ (Leave) ක්‍රියාවලිය
  const confirmLeave = async () => {
    if (activeStudent) {
      try {
        const studentRef = doc(db, "students", activeStudent.id);
        await updateDoc(studentRef, {
          status: "Leave",
          leftDate: new Date().toISOString()
        });
        setIsLeaveOpen(false);
        // මෙහිදී Google Sheet එකට දත්ත යැවීමේ function එක මීළඟට එක් කළ හැක
      } catch (error) {
        alert("Error updating status: " + error.message);
      }
    }
  };

  const handleLeaveClick = (student) => {
    setActiveStudent(student);
    setIsLeaveOpen(true);
  };

  const handleView = (student) => {
    setActiveStudent(student);
    setIsViewOpen(true);
  };

  const handleEdit = (student) => {
    setActiveStudent(student);
    setIsEditOpen(true);
  };

  const grades = Array.from({ length: 11 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header lang={lang} setLang={setLang} />
      
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-gray-100 border-r border-gray-200 p-4">
          <h3 className="font-bold text-gray-700 mb-4 px-2 uppercase tracking-wider text-sm">
            {lang === 'si' ? "ශ්‍රේණිය තෝරන්න" : "Select Grade"}
          </h3>
          <nav className="space-y-1">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedGrade === grade 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'si' ? `${grade} ශ්‍රේණිය` : `Grade ${grade}`}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content (Table) */}
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {lang === 'si' ? `${selectedGrade} ශ්‍රේණියේ සිසුන්` : `Students of Grade ${selectedGrade}`}
            </h2>
          </div>

          <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white text-sm">
              <tr>
                <th className="p-4 text-left border-r border-gray-700">
                {lang === 'si' ? 'ඇතුලත් වීමේ අංකය' : 'Admission No'}
                </th>
                <th className="p-4 text-left border-r border-gray-700">
                {lang === 'si' ? 'නම' : 'Name'}
                </th>
                <th className="p-4 text-left border-r border-gray-700">
                {lang === 'si' ? 'ඇතුලත් වූ දිනය' : 'Admitted Date'}
                </th>
                <th className="p-4 text-left border-r border-gray-700">
                {lang === 'si' ? 'භාරකරුගේ නම' : 'Guardian Name'}
                </th>
                <th className="p-4 text-left border-r border-gray-700">
                {lang === 'si' ? 'දුරකථන අංකය' : 'Guardian T.P'}
                </th>
                <th className="p-4 text-left border-r border-gray-700">
                {lang === 'si' ? 'තත්වය' : 'Status'}
                </th>
                <th className="p-4 text-center">
                {lang === 'si' ? 'ක්‍රියාකාරකම්' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm divide-y">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center animate-pulse">Loading Students...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No active students found for Grade {selectedGrade}.</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{student.admissionNo}</td>
                    <td className="p-3 font-semibold">{student.fullName}</td>
                    <td className="p-3 md:table-cell hidden">{student.admissionDate}</td>
                    <td className="p-3">{student.guardianName}</td>
                    <td className="p-3 md:table-cell hidden font-mono">{student.guardianTP}</td>
                    <td className="p-3">
                      <span className={`px-4 py-1 rounded-full text-xs font-bold ${student.status === 'Leave' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleView(student)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          {lang === 'si' ? 'බලන්න' : 'View'}
                        </button>
                        <button 
                          onClick={() => handleEdit(student)}
                          className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                        >
                          {lang === 'si' ? 'සංස්කරණය' : 'Edit'}
                        </button>
                        <button 
                          onClick={() => handleLeaveClick(student)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          {lang === 'si' ? 'ඉවත් වීම' : 'Leave'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
      
      <Footer lang={lang} />

      {/* Modals */}
      {isViewOpen && (
        <ViewModal 
          isOpen={isViewOpen} 
          onClose={() => setIsViewOpen(false)} 
          student={activeStudent} 
          lang={lang} 
        />
      )}
      {isEditOpen && (
        <EditModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          student={activeStudent} 
          lang={lang} 
        />
      )}

      <LeaveConfirmModal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onConfirm={confirmLeave}
        studentName={activeStudent?.name || ''}
        lang={lang}
      />
    </div>
  );
}