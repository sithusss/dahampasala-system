// components/EditModal.js
import React, { useState, useEffect } from 'react';
//import { db } from '../lib/firebase';
import { doc, updateDoc } from "firebase/firestore";

const InputField = ({ labelEn, labelSi, name, type = "text", value, onChange, className = "", readOnly = false }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-tight">
      {labelEn} / {labelSi}
    </label>
    <input 
      name={name}
      type={type} 
      value={value || ''} 
      onChange={onChange}
      readOnly={readOnly}
      className={`p-2.5 border rounded-lg outline-none text-sm font-semibold text-gray-900 shadow-sm transition-all
        ${readOnly 
          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-500' 
          : 'bg-white focus:ring-2 focus:ring-black border-gray-400 focus:border-black'}`} 
    />
  </div>
);

export default function EditModal({ student, isOpen, onClose, lang }) {
  const isSi = lang === 'si';
  const [loading, setLoading] = useState(false);
  
  // 1. Edit කරන දත්ත තබා ගැනීමට State එකක්
  const [editData, setEditData] = useState({});

  // 2. Modal එක open වන සෑම විටම අදාළ ශිෂ්‍යයාගේ දත්ත State එකට ඇතුළත් කිරීම
  useEffect(() => {
    if (student) {
      setEditData(student);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // 3. Input එකක් වෙනස් වන විට State එක update කිරීම
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 4. දත්ත Update කිරීමේ Function එක
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase එකේ අදාළ Document එක reference කිරීම
      // මෙහි student.id ලෙස පාවිච්චි කළ යුත්තේ Firestore document ID එකයි
      const studentRef = doc(db, "students", student.id);
      
      await updateDoc(studentRef, editData);

      alert(isSi ? "තොරතුරු සාර්ථකව යාවත්කාලීන කළා!" : "Records updated successfully!");
      onClose(); // Modal එක වසා දැමීම
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#F3F4F6] rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-300 flex flex-col">
        
        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase">
              {isSi ? "ශිෂ්‍ය තොරතුරු සංස්කරණය" : "Edit Student Information"}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              ID: {student.admissionNo} | {student.name}
            </p>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="Admission No" labelSi="ඇතුලත් වීමේ අංකය" name="admissionNo" value={editData.admissionNo} readOnly={true} />
              <InputField labelEn="Admission Date" labelSi="ඇතුලත් වූ දිනය" name="admittedDate" type="date" value={editData.admittedDate} onChange={handleChange} />
              <InputField labelEn="Full Name" labelSi="සම්පූර්ණ නම" name="name" value={editData.name} onChange={handleChange} className="md:col-span-2" />
              <InputField labelEn="Birth Day" labelSi="උපන්දිනය" name="dob" type="date" value={editData.dob} onChange={handleChange} />
              <InputField labelEn="Admitted Grade" labelSi="ශ්‍රේණිය" name="grade" value={editData.grade} onChange={handleChange} />
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase">Permanent Address</label>
                <textarea name="address" value={editData.address || ''} onChange={handleChange} rows="2" className="p-2.5 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black bg-white"></textarea>
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase">Current Address</label>
                <textarea name="currentAddress" value={editData.currentAddress || ''} onChange={handleChange} rows="2" className="p-2.5 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black bg-white"></textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Parents */}
          <div className="space-y-4 bg-gray-200/70 p-5 rounded-xl border border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="Mother's Name" labelSi="මවගේ නම" name="motherName" value={editData.motherName} onChange={handleChange} />
              <InputField labelEn="Mother's T.P" labelSi="මවගේ දුරකථන අංකය" name="motherTP" value={editData.motherTP} onChange={handleChange} />
              <InputField labelEn="Father's Name" labelSi="පියාගේ නම" name="fatherName" value={editData.fatherName} onChange={handleChange} />
              <InputField labelEn="Father's T.P" labelSi="පියාගේ දුරකථන අංකය" name="fatherTP" value={editData.fatherTP} onChange={handleChange} />
              <InputField labelEn="Guardian's Name" labelSi="භාරකරුගේ නම" name="guardianName" value={editData.guardianName} onChange={handleChange} />
              <InputField labelEn="Guardian's T.P" labelSi="භාරකරුගේ දුරකථන අංකය" name="guardianTP" value={editData.guardianTP} onChange={handleChange} />
            </div>
          </div>

          {/* Section 4: Extra */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="School Name" labelSi="පාසලේ නම" name="schoolName" value={editData.schoolName} onChange={handleChange} className="md:col-span-2" />
              <InputField labelEn="Occupation" labelSi="රැකියාව" name="occupation" value={editData.occupation} onChange={handleChange} />
              <InputField labelEn="Distance" labelSi="දුර" name="distance" value={editData.distance} onChange={handleChange} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6 shrink-0">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 bg-[#800000] text-white py-4 rounded-xl font-bold uppercase shadow-lg transition-all ${loading ? 'opacity-50' : 'hover:bg-black active:scale-[0.98]'}`}
            >
              {loading ? (isSi ? "යාවත්කාලීන වෙමින්..." : "Updating...") : (isSi ? "යාවත්කාලීන කරන්න" : "Update Student Records")}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-4 rounded-xl font-bold uppercase hover:bg-gray-50">
              {isSi ? "අවලංගු කරන්න" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}