// components/EditModal.js
import React from 'react';

const InputField = ({ labelEn, labelSi, type = "text", defaultValue, className = "", readOnly = false }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-tight">
      {labelEn} / {labelSi}
    </label>
    <input 
      type={type} 
      defaultValue={defaultValue} 
      readOnly={readOnly}
      className={`p-2.5 border rounded-lg outline-none text-sm font-semibold text-gray-900 shadow-sm transition-all
        ${readOnly 
          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' 
          : 'bg-white focus:ring-2 focus:ring-black border-gray-400 focus:border-black'}`} 
    />
  </div>
);

export default function EditModal({ student, isOpen, onClose, lang }) {
  if (!isOpen || !student) return null;
  const isSi = lang === 'si';

  // Form එක submit කිරීමේදී ක්‍රියාත්මක වන function එක
  const handleSubmit = (e) => {
    e.preventDefault();
    // මෙතැනදී Firebase Update Logic එක පසුව ඇතුළත් කළ හැක
    console.log("Updating student:", student.admissionNo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#F3F4F6] rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-300 flex flex-col">
        
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase">
              {isSi ? "ශිෂ්‍ය තොරතුරු සංස්කරණය" : "Edit Student Information"}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              ID: {student.admissionNo} | {student.name}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors text-3xl"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">
              Basic Details / මූලික තොරතුරු
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField 
                labelEn="Admission No" 
                labelSi="ඇතුලත් වීමේ අංකය" 
                defaultValue={student.admissionNo} 
                readOnly={true} 
              />
              <InputField 
                labelEn="Admission Date" 
                labelSi="ඇතුලත් වූ දිනය" 
                type="date" 
                defaultValue={student.admittedDate} 
              />
              <InputField 
                labelEn="Full Name" 
                labelSi="සම්පූර්ණ නම" 
                defaultValue={student.name} 
                className="md:col-span-2" 
              />
              <InputField 
                labelEn="Birth Day" 
                labelSi="උපන්දිනය" 
                type="date" 
                defaultValue={student.dob} 
              />
              <InputField 
                labelEn="Admitted Grade" 
                labelSi="ශ්‍රේණිය" 
                defaultValue={student.grade} 
              />
            </div>
          </div>

          {/* Section 2: Address Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">
              Address / ලිපිනය
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase">Permanent Address / ස්ථිර ලිපිනය</label>
                <textarea 
                  defaultValue={student.address} 
                  rows="2" 
                  className="p-2.5 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-black bg-white"
                ></textarea>
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase">Current Address / පදිංචි ලිපිනය</label>
                <textarea 
                  defaultValue={student.currentAddress} 
                  rows="2" 
                  className="p-2.5 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-black bg-white"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Parents/Guardian - High Contrast Background */}
          <div className="space-y-4 bg-gray-200/70 p-5 rounded-xl border border-gray-300 shadow-inner">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
              Parents & Guardian / දෙමාපියන් සහ භාරකරු
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="Mother's Name" labelSi="මවගේ නම" defaultValue={student.motherName} />
              <InputField labelEn="Mother's T.P" labelSi="මවගේ දුරකථන අංකය" defaultValue={student.motherTP} />
              <InputField labelEn="Father's Name" labelSi="පියාගේ නම" defaultValue={student.fatherName} />
              <InputField labelEn="Father's T.P" labelSi="පියාගේ දුරකථන අංකය" defaultValue={student.fatherTP} />
              <InputField labelEn="Guardian's Name" labelSi="භාරකරුගේ නම" defaultValue={student.guardianName} />
              <InputField labelEn="Guardian's T.P" labelSi="භාරකරුගේ දුරකථන අංකය" defaultValue={student.guardianTP} />
            </div>
          </div>

          {/* Section 4: Other Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">
              Other Details / අනෙකුත් තොරතුරු
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="School Name" labelSi="පාසලේ නම" defaultValue={student.schoolName} className="md:col-span-2" />
              <InputField labelEn="Occupation" labelSi="රැකියාව" defaultValue={student.occupation} />
              <InputField labelEn="Distance to Home" labelSi="නිවසට ඇති දුර" defaultValue={student.distance} />
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 shrink-0">
            <button 
              type="submit" 
              className="flex-1 bg-[#800000] text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all uppercase shadow-lg active:scale-[0.98]"
            >
              {isSi ? "යාවත්කාලීන කරන්න" : "Update Student Records"}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all uppercase active:scale-[0.98]"
            >
              {isSi ? "අවලංගු කරන්න" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}