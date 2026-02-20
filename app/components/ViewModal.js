// components/ViewModal.js

const formatDriveUrl = (url) => {
  if (!url) return "/placeholder.png";
  
  // Google Drive link එකක්දැයි පරීක්ෂා කිරීම
  if (url.includes("drive.google.com")) {
    // Regular Expression එකකින් ID එක පමණක් වෙන් කර ගැනීම
    const match = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/u/0/d/${match[1]}`;
    }
  }
  return url;
};

const DetailRow = ({ labelEn, labelSi, value }) => (
  <div className="border-b border-gray-100 py-2">
    <p className="text-[10px] uppercase font-bold text-gray-400">
      {labelEn} / {labelSi}
    </p>
    <p className="text-sm font-semibold text-gray-800">{value || "N/A"}</p>
  </div>
);

export default function ViewModal({ student, isOpen, onClose, lang }) {
  if (!isOpen || !student) return null;
  const isSi = lang === 'si';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#800000] text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            {isSi ? "සිසුවාගේ සම්පූර්ණ තොරතුරු" : "Full Student Profile"}
          </h2>
          <button onClick={onClose} className="text-3xl hover:text-gray-400">&times;</button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Image & Identity */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-48 rounded-2xl border-4 border-gray-100 overflow-hidden shadow-md">
                <img 
                  src={student.imageUrl || "/placeholder.png"} 
                  className="object-cover w-full h-full" 
                  alt="Student" 
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase">Status</p>
                <span className={`px-4 py-1 rounded-full text-xs font-bold ${student.status === 'Leave' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {student.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Right: All Data Fields */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow labelEn="Admission No" labelSi="ඇතුලත් වීමේ අංකය" value={student.admissionNo} />
              <DetailRow labelEn="Admission Date" labelSi="ඇතුලත් වූ දිනය" value={student.admissionDate} />
              <DetailRow labelEn="Full Name" labelSi="සම්පූර්ණ නම" value={student.fullName} />
              <DetailRow labelEn="Birth Day" labelSi="උපන්දිනය" value={student.birthDate} />
              <DetailRow labelEn="Admitted Grade" labelSi="ඇතුලත් වන ශ්‍රේණිය" value={student.admittedGrade} />
              <DetailRow labelEn="School Name" labelSi="පාසලේ නම" value={student.school} />
              <DetailRow labelEn="Permanent Address" labelSi="ස්ථිර ලිපිනය" value={student.permanentAddr} />
              <DetailRow labelEn="Current Address" labelSi="පදිංචි ලිපිනය" value={student.currentAddr} />
              <DetailRow labelEn="Mother's Name" labelSi="මවගේ නම" value={student.mother} />
              <DetailRow labelEn="Mother's T.P" labelSi="මවගේ දුරකථන අංකය" value={student.motherTP} />
              <DetailRow labelEn="Father's Name" labelSi="පියාගේ නම" value={student.father} />
              <DetailRow labelEn="Father's T.P" labelSi="පියාගේ දුරකථන අංකය" value={student.fatherTP} />
              <DetailRow labelEn="Guardian's Name" labelSi="භාරකරුගේ නම" value={student.guardianName} />
              <DetailRow labelEn="Guardian's T.P" labelSi="භාරකරුගේ දුරකථන අංකය" value={student.guardianTP} />
              <DetailRow labelEn="Occupation" labelSi="රැකියාව" value={student.occupation} />
              <DetailRow labelEn="Distance" labelSi="නිවසට ඇති දුර" value={student.distance} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}