// components/EditModal.js
import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase'; // Firebase config එකෙන් මේවා ලබාගන්න
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import toast from 'react-hot-toast';

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
  const [editData, setEditData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (student) {
      setEditData(student);
      setPreviewUrl(student.imageUrl);
      setNewImage(null);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

    const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let finalImageUrl = editData.imageUrl;

    if (newImage) {
      // 1. පැරණි පින්තූරය ඉවත් කිරීමේ නිවැරදි ක්‍රමය
      if (editData.imageUrl && editData.imageUrl.includes("firebase")) {
        try {
          const oldImageRef = ref(storage, editData.imageUrl);
          await deleteObject(oldImageRef);
          console.log("Old image deleted successfully");
        } catch (deleteError) {
          // Object not found (code/object-not-found) means it was already deleted — safe to ignore.
          // Any other error means the old image was NOT deleted from Storage.
          if (deleteError.code !== "storage/object-not-found") {
            console.warn("Old image could not be deleted from Storage:", deleteError.message);
            toast(
              isSi
                ? "පැරණි ඡායාරූපය ඉවත් කිරීමට නොහැකි විය. Storage හි රැඳී ඇත."
                : "Old image could not be removed from Storage.",
              { icon: "⚠️", duration: 5000, style: { borderRadius: "10px", background: "#7c3a00", color: "#fff" } }
            );
          }
        }
      }

      // 2. නව පින්තූරය Upload කිරීම
      const storageRef = ref(storage, `students/${editData.fullName}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, newImage);
      finalImageUrl = await getDownloadURL(snapshot.ref);
    }

    // 3. Firestore Update කිරීම
    const studentRef = doc(db, "students", student.id);
    await updateDoc(studentRef, {
      ...editData,
      editedBy: localStorage.getItem('userEmail') || localStorage.getItem('userId') || 'unknown',
      imageUrl: finalImageUrl
    });

    toast.success(isSi ? "යාවත්කාලීනය සාර්ථකයි!" : "Update Successful!", {
        duration: 4000,
        style: { borderRadius: '10px', background: '#02591f', color: '#fff' }
      });
    onClose();
  } catch (error) {
    toast.error(isSi ? "දෝෂයක් සිදුවිය: " + error.message : "Error: " + error.message, {
        duration: 4000,
        style: { borderRadius: '10px', background: '#8a0b0b', color: '#fff' }
      });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#F3F4F6] rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-300 flex flex-col">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase">
              {isSi ? "ශිෂ්‍ය තොරතුරු සංස්කරණය" : "Edit Student Information"}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              ID: {editData.admissionNo} | {editData.fullName}
            </p>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-8">
          
          {/* Section: Image Update */}
          <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-300">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-tight border-b pb-1">Student Image / ඡායාරූපය</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner bg-gray-50">
                <img 
                  src={previewUrl || "/images/placeholder.png"} 
                  alt="Student Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isSi ? "නව පින්තූරයක් තෝරන්න" : "Change Student Photo"}
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="Admission No" labelSi="ඇතුලත් වීමේ අංකය" name="admissionNo" value={editData.admissionNo} onChange={handleChange} />
              <InputField labelEn="Admission Date" labelSi="ඇතුලත් වූ දිනය" name="admissionDate" type="date" value={editData.admissionDate} onChange={handleChange} />
              <InputField labelEn="Full Name" labelSi="සම්පූර්ණ නම" name="fullName" value={editData.fullName} onChange={handleChange} className="md:col-span-2" />
              <InputField labelEn="Birth Day" labelSi="උපන්දිනය" name="birthDate" type="date" value={editData.birthDate} onChange={handleChange} />
              <InputField labelEn="Admitted Grade" labelSi="ශ්‍රේණිය" name="admittedGrade" value={editData.admittedGrade} readOnly={true} />
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase">Permanent Address</label>
                <textarea name="permanentAddr" value={editData.permanentAddr || ''} onChange={handleChange} rows="2" className="p-2.5 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black bg-white"></textarea>
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-700 mb-1 uppercase">Current Address</label>
                <textarea name="currentAddr" value={editData.currentAddr || ''} onChange={handleChange} rows="2" className="p-2.5 border border-gray-400 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black bg-white"></textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Parents */}
          <div className="space-y-4 bg-gray-200/70 p-5 rounded-xl border border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="Mother's Name" labelSi="මවගේ නම" name="mother" value={editData.mother} onChange={handleChange} />
              <InputField labelEn="Mother's T.P" labelSi="මවගේ දුරකථන අංකය" name="motherTP" value={editData.motherTP} onChange={handleChange} />
              <InputField labelEn="Father's Name" labelSi="පියාගේ නම" name="father" value={editData.father} onChange={handleChange} />
              <InputField labelEn="Father's T.P" labelSi="පියාගේ දුරකථන අංකය" name="fatherTP" value={editData.fatherTP} onChange={handleChange} />
              <InputField labelEn="Guardian's Name" labelSi="භාරකරුගේ නම" name="guardianName" value={editData.guardianName} onChange={handleChange} />
              <InputField labelEn="Guardian's T.P" labelSi="භාරකරුගේ දුරකථන අංකය" name="guardianTP" value={editData.guardianTP} onChange={handleChange} />
            </div>
          </div>

          {/* Section 4: Extra */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField labelEn="School Name" labelSi="පාසලේ නම" name="school" value={editData.school} onChange={handleChange} className="md:col-span-2" />
              <InputField labelEn="Occupation" labelSi="රැකියාව" name="occupation" value={editData.occupation} onChange={handleChange} />
              <InputField labelEn="Distance" labelSi="දුර" name="distance" value={editData.distance} onChange={handleChange} />
            </div>
          </div>

          {/* Section 5: Final Exam Results */}
          <div className="space-y-4 bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-1">Final Exam Results / අවසාන විභාගයේ ප්‍රතිඵල</h3>
            
            {/* Faced Final Exam Checkbox */}
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="facedFinalExam" 
                checked={editData.facedFinalExam || false}
                onChange={(e) => setEditData(prev => ({ ...prev, facedFinalExam: e.target.checked }))}
                className="w-5 h-5 rounded cursor-pointer border-gray-400 accent-[#800000]"
              />
              <label className="text-sm font-bold text-gray-700 uppercase">
                {isSi ? "අවසාන විභාගයට සහභාගී විය" : "Faced Final Exam"}
              </label>
            </div>

            {/* Exam Results Fields - Only shown if Faced Final Exam is checked */}
            {editData.facedFinalExam && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-white rounded-lg border border-blue-100">
                <InputField 
                  labelEn="Buddha Charithay" 
                  labelSi="බුද්ධ චරිතය" 
                  name="buddha_charithay" 
                  value={editData.finalExamResults?.buddha_charithay || ''} 
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    finalExamResults: { ...prev.finalExamResults, buddha_charithay: e.target.value }
                  }))}
                />
                <InputField 
                  labelEn="Buddha Sanskruthiya" 
                  labelSi="බුද්ධ සංස්කෘතිය" 
                  name="buddha_sanskruthiya" 
                  value={editData.finalExamResults?.buddha_sanskruthiya || ''} 
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    finalExamResults: { ...prev.finalExamResults, buddha_sanskruthiya: e.target.value }
                  }))}
                />
                <InputField 
                  labelEn="Pali Abhidharma" 
                  labelSi="පාලි අභිධර්ම" 
                  name="pali_abhidharma" 
                  value={editData.finalExamResults?.pali_abhidharma || ''} 
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    finalExamResults: { ...prev.finalExamResults, pali_abhidharma: e.target.value }
                  }))}
                />
                <InputField 
                  labelEn="Shasana Ithihasaya" 
                  labelSi="ශාසන ඉතිහාසය" 
                  name="shasana_ithihasaya" 
                  value={editData.finalExamResults?.shasana_ithihasaya || ''} 
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    finalExamResults: { ...prev.finalExamResults, shasana_ithihasaya: e.target.value }
                  }))}
                />
              </div>
            )}
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