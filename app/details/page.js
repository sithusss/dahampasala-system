// pages/details.js
"use client";
import { useState } from 'react';
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
  const [activeStudent, setActiveStudent] = useState(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const handleLeaveClick = (student) => {
    setActiveStudent(student);
    setIsLeaveOpen(true);
  };

  const confirmLeave = () => {
    // මෙතැනදී Firebase update එක සිදු කරන්න
    console.log("Status updated to Leave for:", activeStudent.admissionNo);
    setIsLeaveOpen(false);
  };

  const grades = Array.from({ length: 11 }, (_, i) => i + 1);

  // සිසුවාගේ විස්තර පෙන්වීමට
  const handleView = (student) => {
    setActiveStudent(student);
    setIsViewOpen(true);
  };

  // සිසුවාගේ විස්තර Edit කිරීමට
  const handleEdit = (student) => {
    setActiveStudent(student);
    setIsEditOpen(true);
  };

  // සාම්පල දත්ත (Database එක සම්බන්ධ කළ පසු මෙය ඉවත් කරන්න)
  const dummyStudent = {
    admissionNo: "1024",
    name: "Kamal Perera",
    admittedDate: "2026-01-10",
    dob: "2015-05-12",
    grade: "1",
    guardianName: "Sunil Perera",
    guardianTP: "0771234567",
    address: "Kandy Road, Kandy",
    currentAddress: "Asgiriya, Kandy",
    motherName: "Nimala Perera",
    motherTP: "0777654321",
    fatherName: "Sunil Perera",
    fatherTP: "0771234567",
    schoolName: "Kingswood College",
    occupation: "Business",
    distance: "2km",
    status: "Active"
  };

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
              {/* Dummy row for testing */}
              <tr className="hover:bg-gray-50 transition">
                <td className="p-3 font-medium">{dummyStudent.admissionNo}</td>
                <td className="p-3">{dummyStudent.name}</td>
                <td className="p-3">{dummyStudent.admittedDate}</td>
                <td className="p-3">{dummyStudent.guardianName}</td>
                <td className="p-3">{dummyStudent.guardianTP}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                    {dummyStudent.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleView(dummyStudent)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      {lang === 'si' ? 'බලන්න' : 'View'}
                    </button>
                    <button 
                      onClick={() => handleEdit(dummyStudent)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      {lang === 'si' ? 'සංස්කරණය' : 'Edit'}
                    </button>
                    <button 
                      onClick={() => handleLeaveClick(dummyStudent)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      {lang === 'si' ? 'ඉවත් වීම' : 'Leave'}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
      
      {/* Footer */}
      <Footer lang={lang} />

      {/* Modals - මීට කලින් මේවා තිබුණේ div එකෙන් පිටතයි */}
      <ViewModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        student={activeStudent} 
        lang={lang} 
      />
      <EditModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        student={activeStudent} 
        lang={lang} 
      />

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