"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { collection, query, where, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ViewModal from '../components/ViewModal';
import EditModal from '../components/EditModal';
import LeaveConfirmModal from '../components/LeaveConfirmModal';

export default function DetailsPage() {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [lang, setLang] = useState('si');
  const [activeTab, setActiveTab] = useState('active');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [leftStudents, setLeftStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [nextClassLocked, setNextClassLocked] = useState(false);
  const [showNextClassConfirm, setShowNextClassConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [anyUserNextClass, setAnyUserNextClass] = useState(false);
  const [currentUserNextClass, setCurrentUserNextClass] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    const loginTime = localStorage.getItem('loginTime');
    const userId = localStorage.getItem('userId');
    if (loginTime && userId) {
      const elapsed = new Date().getTime() - parseInt(loginTime);
      const remaining = (6 * 60 * 60 * 1000) - elapsed;
      
      if (remaining > 0) {
        setTimeout(async () => {
          await setDoc(doc(db, "user", userId), { login: false }, { merge: true });
          localStorage.clear();
          window.location.href = '/';
        }, remaining);
      } else {
        setDoc(doc(db, "user", userId), { login: false }, { merge: true });
        localStorage.clear();
        window.location.href = '/';
      }
    }
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "students"), 
      where("admittedGrade", "in", [Number(selectedGrade), selectedGrade.toString()])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentList.filter(s => s.status !== 'Leave'));
      setLeftStudents(studentList.filter(s => s.status === 'Leave'));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedGrade]);

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllStudents(allList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    const userRef = doc(db, "user", userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const nextClass = docSnap.data().next_class === true;
        setCurrentUserNextClass(nextClass);
        setCanReset(nextClass);
      } else {
        setCurrentUserNextClass(false);
        setCanReset(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "user"), where("next_class", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnyUserNextClass(!snapshot.empty);
    });
    return () => unsubscribe();
  }, []);

  const confirmLeave = async () => {
    if (activeStudent) {
      try {
        const leftDate = new Date().toISOString();
        
        await setDoc(doc(db, "students", activeStudent.id), {
          ...activeStudent,
          status: "Leave",
          leftDate: leftDate
        }, { merge: true });
        
        setIsLeaveOpen(false);
        toast.success("Student status updated to Leave!");
      } catch (error) {
        toast.error("Error: " + error.message);
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

  const downloadCSV = (data, filename) => {
    const headers = ['Admission No', 'Full Name', 'Birth Date', 'Admitted Grade', 'Admission Date', 'School', 'Permanent Address', 'Current Address', 'Mother', 'Mother TP', 'Father', 'Father TP', 'Guardian Name', 'Guardian TP', 'Occupation', 'Distance', 'Status', 'Left Date'];
    const csvContent = [
      headers.join(','),
      ...data.map(s => [
        s.admissionNo || '',
        `"${s.fullName || ''}"`,
        s.birthDate || '',
        s.admittedGrade || '',
        s.admissionDate || '',
        `"${s.school || ''}"`,
        `"${s.permanentAddr || ''}"`,
        `"${s.currentAddr || ''}"`,
        `"${s.mother || ''}"`,
        s.motherTP || '',
        `"${s.father || ''}"`,
        s.fatherTP || '',
        `"${s.guardianName || ''}"`,
        s.guardianTP || '',
        `"${s.occupation || ''}"`,
        s.distance || '',
        s.status || 'Active',
        s.leftDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success('CSV Downloaded!');
  };

  const handleDownloadCSV = (type) => {
    if (type === 'all') {
      const dataToDownload = activeTab === 'active' 
        ? allStudents.filter(s => s.status !== 'Leave')
        : allStudents.filter(s => s.status === 'Leave');
      downloadCSV(dataToDownload, `all_${activeTab}_students.csv`);
    } else {
      const dataToDownload = activeTab === 'active' ? students : leftStudents;
      downloadCSV(dataToDownload, `grade_${selectedGrade}_${activeTab}_students.csv`);
    }
    setShowDropdown(false);
  };

  const handleNextClass = async () => {
    setShowNextClassConfirm(false);
    
    try {
      const userId = localStorage.getItem('userId');
      
      for (const student of allStudents) {
        const currentGrade = Number(student.admittedGrade);
        const newGrade = currentGrade >= 11 ? null : currentGrade + 1;
        await setDoc(doc(db, "students", student.id), {
          ...student,
          admittedGrade: newGrade,
          previousGrade: currentGrade
        }, { merge: true });
      }
      
      await setDoc(doc(db, "user", userId), {
        next_class: true
      }, { merge: true });
      
      toast.success(lang === 'si' ? 'සියලු සිසුන් ඊළඟ ශ්රේණියට ගියා!' : 'All students moved to next class!');
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    
    try {
      const studentsWithPrevGrade = allStudents.filter(s => s.previousGrade);
      
      for (const student of studentsWithPrevGrade) {
        await setDoc(doc(db, "students", student.id), {
          ...student,
          admittedGrade: student.previousGrade,
          previousGrade: null
        }, { merge: true });
      }
      
      toast.success(lang === 'si' ? 'ශ්රේණි නැවත පෙර තත්වයට!' : 'Grades reverted!');
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header lang={lang} setLang={setLang} />
      
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-100 border-r border-gray-200 p-4">
          <h3 className="font-bold text-gray-700 mb-4 px-2 uppercase tracking-wider text-sm">
            {lang === 'si' ? "ශ්රේණිය තෝරන්න" : "Select Grade"}
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
                {lang === 'si' ? `${grade} ශ්රේණිය` : `Grade ${grade}`}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 border-b">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-3 font-bold transition-all ${
                  activeTab === 'active'
                    ? 'border-b-4 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang === 'si' ? 'ක්රියාකාරී සිසුන්' : 'Active Students'}
              </button>
              <button
                onClick={() => setActiveTab('left')}
                className={`px-6 py-3 font-bold transition-all ${
                  activeTab === 'left'
                    ? 'border-b-4 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang === 'si' ? 'ඉවත් වූ සිසුන්' : 'Left Students'}
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {lang === 'si' ? 'CSV බාගන්න' : 'Download CSV'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => handleDownloadCSV('grade')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm font-semibold text-gray-700 rounded-t-lg transition"
                  >
                    {lang === 'si' ? `${selectedGrade} ශ්රේණිය` : `Grade ${selectedGrade}`}
                  </button>
                  <button
                    onClick={() => handleDownloadCSV('all')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm font-semibold text-gray-700 rounded-b-lg transition border-t"
                  >
                    {lang === 'si' ? 'සියලු ශ්රේණි' : 'All Grades'}
                  </button>
                </div>
              )}
            </div>
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
                {activeTab === 'left' && (
                  <th className="p-4 text-left border-r border-gray-700">
                    {lang === 'si' ? 'ඉවත් වූ දිනය' : 'Left Date'}
                  </th>
                )}
                <th className="p-4 text-left border-r border-gray-700">
                  {lang === 'si' ? 'භාරකරුගේ නම' : 'Guardian Name'}
                </th>
                <th className="p-4 text-left border-r border-gray-700">
                  {lang === 'si' ? 'දුරකථන අංකය' : 'Guardian T.P'}
                </th>
                <th className="p-4 text-center">
                  {lang === 'si' ? 'ක්රියාකාරකම්' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm divide-y">
              {loading ? (
                <tr><td colSpan={activeTab === 'left' ? "7" : "6"} className="p-10 text-center animate-pulse">Loading Students...</td></tr>
              ) : activeTab === 'active' ? (
                students.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No active students found for Grade {selectedGrade}.</td></tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{student.admissionNo || '-'}</td>
                      <td className="p-3 font-semibold">{student.fullName || '-'}</td>
                      <td className="p-3">{student.admissionDate || '-'}</td>
                      <td className="p-3">{student.guardianName || '-'}</td>
                      <td className="p-3 font-mono">{student.guardianTP || '-'}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleView(student)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                            {lang === 'si' ? 'බලන්න' : 'View'}
                          </button>
                          <button onClick={() => handleEdit(student)} className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600">
                            {lang === 'si' ? 'සංස්කරණය' : 'Edit'}
                          </button>
                          <button onClick={() => handleLeaveClick(student)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                            {lang === 'si' ? 'ඉවත් කරන්න' : 'Leave'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                leftStudents.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-gray-400 italic">No left students found for Grade {selectedGrade}.</td></tr>
                ) : (
                  leftStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-medium">{student.admissionNo || '-'}</td>
                      <td className="p-3 font-semibold">{student.fullName || '-'}</td>
                      <td className="p-3">{student.admissionDate || '-'}</td>
                      <td className="p-3">{student.leftDate || '-'}</td>
                      <td className="p-3">{student.guardianName || '-'}</td>
                      <td className="p-3 font-mono">{student.guardianTP || '-'}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleView(student)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                            {lang === 'si' ? 'බලන්න' : 'View'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </main>
      </div>

      <Footer />

      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => setShowNextClassConfirm(true)}
          disabled={anyUserNextClass && !['super-admin', 'superadmin', 'admin'].includes(userRole)}
          className={`px-4 py-3 text-white text-sm font-bold rounded-full shadow-lg transition flex items-center gap-2 ${
            (anyUserNextClass && !['super-admin', 'superadmin', 'admin'].includes(userRole))
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={lang === 'si' ? 'ඊළඟ ශ්රේණියට' : 'To Next Class'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {lang === 'si' ? 'ඊළඟ ශ්රේණිය' : 'Next Class'}
        </button>
        <button
          onClick={() => setShowResetConfirm(true)}
          disabled={!currentUserNextClass && !['super-admin', 'superadmin', 'admin'].includes(userRole)}
          className={`px-4 py-3 text-white text-sm font-bold rounded-full shadow-lg transition flex items-center gap-2 ${
            (!currentUserNextClass && !['super-admin', 'superadmin', 'admin'].includes(userRole))
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
          title={lang === 'si' ? 'නැවත පෙර තත්වයට' : 'Undo'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {lang === 'si' ? 'නැවත පෙර තත්වයට' : 'Undo'}
        </button>
      </div>

      {isViewOpen && activeStudent && (
        <ViewModal student={activeStudent} isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} lang={lang} />
      )}

      {isEditOpen && activeStudent && (
        <EditModal student={activeStudent} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} lang={lang} />
      )}

      {isLeaveOpen && activeStudent && (
        <LeaveConfirmModal
          isOpen={isLeaveOpen}
          studentName={activeStudent.fullName}
          onConfirm={confirmLeave}
          onClose={() => setIsLeaveOpen(false)}
          lang={lang}
        />
      )}

      {showNextClassConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {lang === 'si' ? 'ඊළඟ ශ්රේණියට යවන්න' : 'Move to Next Class'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                {lang === 'si' 
                  ? 'සියලු සිසුන් ඊළඟ ශ්රේණියට යවන්නද?' 
                  : 'Move all students to next class?'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 flex gap-3">
              <button
                onClick={() => setShowNextClassConfirm(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                {lang === 'si' ? 'නැත' : 'Cancel'}
              </button>
              <button
                onClick={handleNextClass}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
              >
                {lang === 'si' ? 'ඔව්' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {lang === 'si' ? 'නැවත පෙර තත්වයට' : 'Undo Changes'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                {lang === 'si' 
                  ? 'ශ්රේණි වෙනස් කිරීම අහෝසි කරන්නද?' 
                  : 'Undo grade changes?'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                {lang === 'si' ? 'නැත' : 'Cancel'}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition shadow-md"
              >
                {lang === 'si' ? 'ඔව්' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
