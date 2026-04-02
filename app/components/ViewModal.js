import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { generateStudentProfilePDF } from '@/lib/generatePDF';

// තොරතුරු පෙන්වන කුඩා කොටස (Sub-component)
const InfoField = ({ labelEn, labelSi, value }) => (
  <div className="flex flex-col border-b border-gray-100 pb-2">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
      {labelEn} / {labelSi}
    </span>
    <span className="text-sm font-semibold text-gray-800 break-words">
      {value || "—"}
    </span>
  </div>
);

// Helper function to find user by email or mobile
const fetchUserByIdentifier = async (identifier) => {
  if (!identifier || identifier === 'unknown') return 'System';
  
  try {
    // Try matching by email field
    let q = query(collection(db, "user"), where("email", "==", identifier));
    let snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      return userData.full_name || userData.fullName || identifier;
    }

    // Try matching by mobile field
    q = query(collection(db, "user"), where("mobile", "==", identifier));
    snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      return userData.full_name || userData.fullName || identifier;
    }

    // Fallback: return the identifier itself (email or mobile)
    return identifier;
  } catch (err) {
    console.error("Error fetching user:", err);
    return identifier;
  }
};

export default function ViewModal({ student, isOpen, onClose, lang }) {
  const [downloading, setDownloading] = useState(false);
  const [officers, setOfficers] = useState({ reg: "System", edit: "N/A" });
  const isSi = lang === 'si';
  const hasLeaveDetails = Boolean(student?.leaveReason || student?.leftDate);
  const leftDateDisplay = student?.leftDate
    ? String(student.leftDate).split('T')[0]
    : "—";
  const leaveReasonDisplay = student?.leaveReason || "—";
  const hasFinalExamResults = [
    student?.finalExamResults?.buddha_charithay,
    student?.finalExamResults?.buddha_sanskruthiya,
    student?.finalExamResults?.pali_abhidharma,
    student?.finalExamResults?.shasana_ithihasaya
  ].some((value) => String(value || '').trim() !== '');

  // නිලධාරීන්ගේ නම් ලබා ගැනීම
  useEffect(() => {
    const fetchOfficerNames = async () => {
      if (!student || !isOpen) return;
      try {
        let names = { reg: "System", edit: "N/A" };
        
        if (student.registeredBy) {
          names.reg = await fetchUserByIdentifier(student.registeredBy);
        }
        
        if (student.editedBy) {
          names.edit = await fetchUserByIdentifier(student.editedBy);
        }
        
        setOfficers(names);
      } catch (err) { console.error(err); }
    };
    fetchOfficerNames();
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#800000] text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold">{isSi ? "ශිෂ්‍ය තොරතුරු වාර්තාව" : "Student Profile Report"}</h2>
            <p className="text-xs opacity-80">Ref: {student.id}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 w-10 h-10 rounded-full text-2xl">&times;</button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Photo & Stats */}
          <div className="md:col-span-1 flex flex-col items-center border-r border-gray-100 pr-4">
            <div className="w-40 h-48 rounded-lg overflow-hidden border-4 border-gray-50 shadow-md bg-gray-100">
              <img src={student.imageUrl || "/images/placeholder.png"} className="w-full h-full object-cover" alt="Student" />
            </div>
            <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase ${student.status === 'Leave' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {student.status === 'Leave' ? (isSi ? 'ඉවත් වී ඇත' : 'Left') : (isSi ? 'අධ්‍යාපනය ලබයි' : 'Active')}
            </div>
            <div className="mt-6 w-full space-y-4">
               <InfoField labelEn="Admission No" labelSi="ඇතුලත් වීමේ අංකය" value={student.admissionNo} />
               
               <InfoField labelEn="Admission Fee" labelSi="ඇතුලත් වීමේ ගාස්තු" value={student.admissionPaymentDone ? "Paid / ගෙවා ඇත" : "Pending / ගෙවා නැත"} />
            </div>
          </div>
          {/* Right Column: Detailed Fields */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <InfoField labelEn="Full Name" labelSi="සම්පූර්ණ නම" value={student.fullName} />
              </div>
              <InfoField labelEn="Current Grade" labelSi="වත්මන් ශ්‍රේණිය" value={student.currentGrade || student.admittedGrade} />
              <InfoField labelEn="Birth Date" labelSi="උපන්දිනය" value={student.birthDate} />
              <InfoField labelEn="Admission Date" labelSi="ඇතුලත් වූ දිනය" value={student.admissionDate} />
              <InfoField labelEn="Admitted Grade" labelSi="ඇතුලත් වූ ශ්‍රේණිය" value={student.admittedGrade} />
              <InfoField labelEn="School Name" labelSi="පාසල" value={student.school} />
              <InfoField labelEn="Permanent Address" labelSi="ස්ථිර ලිපිනය" value={student.permanentAddr} />
              <InfoField labelEn="Current Address" labelSi="වත්මන් ලිපිනය" value={student.currentAddr} />
              <InfoField labelEn="Distance (KM)" labelSi="දුර (කි.මී.)" value={student.distance} />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100">
              <InfoField labelEn="Mother's Name" labelSi="මවගේ නම" value={student.mother} />
              <InfoField labelEn="Mother's TP" labelSi="මවගේ දුරකථනය" value={student.motherTP} />
              <InfoField labelEn="Father's Name" labelSi="පියාගේ නම" value={student.father} />
              <InfoField labelEn="Father's TP" labelSi="පියාගේ දුරකථනය" value={student.fatherTP} />
              <InfoField labelEn="Guardian's Name" labelSi="භාරකරුගේ නම" value={student.guardianName} />
              <InfoField labelEn="Guardian's TP" labelSi="භාරකරුගේ දුරකථනය" value={student.guardianTP} />
              <InfoField labelEn="Occupation" labelSi="භාරකරුගේ රැකියාව" value={student.occupation} />
            </div>

            {hasLeaveDetails && (
              <div className="bg-red-50 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-red-200">
                <div className="sm:col-span-2 text-sm font-bold text-red-700">
                  {isSi ? 'ඉවත් වීමේ තොරතුරු' : 'Leave Details'}
                </div>
                <InfoField labelEn="Leave Date" labelSi="ඉවත් වූ දිනය" value={leftDateDisplay} />
                <InfoField labelEn="Reason for Leave" labelSi="ඉවත් වීමේ හේතුව" value={leaveReasonDisplay} />
              </div>
            )}

            {/* Final Exam Results */}
            {(student.facedFinalExam || student.finalExamResults) && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="mb-3 text-sm font-bold text-blue-700">
                  {isSi ? 'අවසාන විභාගයේ ප්‍රතිඵල' : 'Final Exam Results'}
                </div>
                {student.facedFinalExam ? (
                  hasFinalExamResults ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoField labelEn="Buddha Charithay" labelSi="බුද්ධ චරිතය" value={student.finalExamResults?.buddha_charithay || "—"} />
                      <InfoField labelEn="Buddha Sanskruthiya" labelSi="බුද්ධ සංස්කෘතිය" value={student.finalExamResults?.buddha_sanskruthiya || "—"} />
                      <InfoField labelEn="Pali Abhidharma" labelSi="පාලි අභිධර්ම" value={student.finalExamResults?.pali_abhidharma || "—"} />
                      <InfoField labelEn="Shasana Ithihasaya" labelSi="ශාසන ඉතිහාසය" value={student.finalExamResults?.shasana_ithihasaya || "—"} />
                    </div>
                  ) : (
                    <div className="text-sm text-blue-600 font-semibold">
                      {isSi ? ('ප්‍රතිඵල බලාපොරොත්තුවෙන් ඇත.') : ('Pending Results')}
                    </div>
                  )
                ) : (
                  <div className="text-sm text-gray-600">
                    {isSi ? ('අවසාන විභාගයට සහභාගී නොවිය') : ('Did not face final exam')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex flex-col gap-4">
          <div className="flex justify-between text-[13px] text-gray-700 italic font-medium px-2">
            <span>{isSi ? "ලියාපදිංචිය" : "Registered By"}: {officers.reg}</span>
            <span>{isSi ? "අවසන් යාවත්කාලීනය" : "Last Update By"}: {officers.edit}</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={async () => {
                setDownloading(true);
                await generateStudentProfilePDF(student, lang, officers.reg, officers.edit);
                setDownloading(false);
              }}
              disabled={downloading}
              className="flex-1 bg-[#800000] hover:bg-black text-white py-3.5 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
            >
              {downloading ? "PROCESSING..." : (isSi ? "PDF වාර්තාව බාගත කරන්න" : "DOWNLOAD PDF REPORT")}
            </button>
            <button onClick={onClose} className="px-8 border-2 border-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-100">
              {isSi ? "වසන්න" : "CLOSE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}