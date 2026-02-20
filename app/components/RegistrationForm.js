"use client";
import { useState } from 'react';
import { db, storage } from '@/lib/firebase'; 
import { doc, getDoc, setDoc,serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from 'react-hot-toast';


export default function RegistrationForm({ lang }) {
  const isSi = lang === 'si';
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // 1. සියලුම පෝරම දත්ත සඳහා එකම State එකක් භාවිතා කිරීම
  const [formData, setFormData] = useState({
    admissionNo: '',
    admissionDate: '',
    fullName: '',
    birthDate: '',
    admittedGrade: '',
    permanentAddr: '',
    currentAddr: '',
    mother: '',
    motherTP: '',
    father: '',
    fatherTP: '',
    guardianName: '',
    guardianTP: '',
    school: '',
    occupation: '',
    distance: '',
    status: 'Active'
  });

  // 2. Input එකක් වෙනස් වන විට State එක update කරන function එක
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

// RegistrationForm.js හි handleSubmit function එක වෙනස් කරන්න

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Admission Number එක හිස්තැන් රහිතව ලබා ගැනීම
      const adNo = formData.admissionNo.trim();

      if (!adNo) {
        toast.error(isSi ? "ඇතුලත් වීමේ අංකය ඇතුලත් කරන්න!" : "Please enter Admission Number!");
        setLoading(false);
        return;
      }

      // 1. මෙම Admission No එකෙන් දැනටමත් ශිෂ්‍යයෙකු ඉන්නවාදැයි පරීක්ෂා කිරීම (Unique Check)
      const docRef = doc(db, "students", adNo);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        toast.error(isSi ? "මෙම ඇතුලත් වීමේ අංකය දැනටමත් පද්ධතියේ පවතී!" : "This Admission Number already exists!", {
          style: { borderRadius: '10px', background: '#8a0b0b', color: '#fff' }
        });
        setLoading(false);
        return; // දැනටමත් සිටී නම් මෙතනින් නතර වේ
      }

      let imageUrl = "";

      // 2. පින්තූරය Firebase Storage වෙත Upload කිරීම
      if (image) {
        // පින්තූරය සඳහා නමක් සෑදීම (Admission No එක භාවිතා කිරීම වඩාත් සුදුසුයි)
        const storageRef = ref(storage, `students/${adNo}_${Date.now()}`);
        
        const snapshot = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 3. Firestore වෙත දත්ත යැවීම (setDoc භාවිතා කර adNo එක ID එක ලෙස යෙදීම)
      await setDoc(doc(db, "students", adNo), {
        ...formData,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
      });

      // සාර්ථක පණිවිඩය
      toast.success(isSi ? "ලියාපදිංචිය සාර්ථකයි!" : "Registration Successful!", {
        duration: 4000,
        style: { borderRadius: '10px', background: '#02591f', color: '#fff' }
      });
      
      // 4. Form එක Reset කිරීම
      setFormData({
        admissionNo: '', admissionDate: '', fullName: '', birthDate: '', admittedGrade: '',
        permanentAddr: '', currentAddr: '', mother: '', motherTP: '',
        father: '', fatherTP: '', guardianName: '', guardianTP: '',
        school: '', occupation: '', distance: '', status: 'Active'
      });
      setImage(null);

    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(isSi ? "දෝෂයක් සිදුවිය: " + error.message : "Error: " + error.message, {
        duration: 4000,
        style: { borderRadius: '10px', background: '#8a0b0b', color: '#fff' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-[#F3F4F6] p-6 md:p-10 rounded-2xl shadow-xl border border-gray-200">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            {isSi ? "ශිෂ්‍ය ලියාපදිංචි කිරීමේ පෝරමය" : "Student Registration Form"}
          </h2>
          <p className="text-gray-500 text-sm italic">
            {isSi ? "* සලකුණු කර ඇති සියලුම තොරතුරු අනිවාර්ය වේ" : "* All marked fields are required"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Admission No / ඇතුලත් වීමේ අංකය *</label>
              <input name="admissionNo" value={formData.admissionNo} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Admission Date / ඇතුලත් වූ දිනය *</label>
              <input name="admissionDate" value={formData.admissionDate} onChange={handleChange} type="date" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2">Full Name / සම්පූර්ණ නම *</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Birth Day / උපන්දිනය *</label>
              <input name="birthDate" value={formData.birthDate} onChange={handleChange} type="date" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Admitted Grade / ඇතුලත් වන ශ්‍රේණිය *</label>
              <select name="admittedGrade" value={formData.admittedGrade} onChange={handleChange} required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700">
                <option value="">Select Grade</option>
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Permanent Address / ස්ථිර ලිපිනය *</label>
              <textarea name="permanentAddr" value={formData.permanentAddr} onChange={handleChange} rows="2" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700"></textarea>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Current Address / පදිංචි ලිපිනය *</label>
              <textarea name="currentAddr" value={formData.currentAddr} onChange={handleChange} rows="2" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700"></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-200/50 p-4 rounded-lg">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Mother&apos;s Name / මවගේ නම *</label>
              <input name="mother" value={formData.mother} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Mother&apos;s T.P / මවගේ දුරකථන අංකය *</label>
              <input name="motherTP" value={formData.motherTP} onChange={handleChange} type="tel" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
            {/* අනෙකුත් දෙමාපිය/භාරකරු fields සඳහාද මෙයම අදාළ වේ (fatherName, fatherTP, guardianName, guardianTP) */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Father&apos;s Name / පියාගේ නම *</label>
              <input name="father" value={formData.father} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Father&apos;s T.P / පියාගේ දුරකථන අංකය *</label>
              <input name="fatherTP" value={formData.fatherTP} onChange={handleChange} type="tel" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2">School Name / ඉගෙනුම ලබ‍න පාසලේ නම *</label>
              <input name="school" value={formData.school} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-200/50 p-4 rounded-lg">
                <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-2">Guardian&apos;s Name / භාරකරුගේ නම *</label>
                <input name="guardianName" value={formData.guardianName} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
                </div>
                <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-2">Guardian&apos;s T.P / භාරකරුගේ දුරකථන අංකය *</label>
                <input name="guardianTP" value={formData.guardianTP} onChange={handleChange} type="tel" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
                </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Guardian&apos;s Occupation / භාරකරුගේ රැකියාව *</label>
              <input name="occupation" value={formData.occupation} onChange={handleChange} type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Distance to Home / නිවසට ඇති දුර *</label>
              <input name="distance" value={formData.distance} onChange={handleChange} type="text" placeholder="e.g. 2km" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white text-gray-700" />
            </div>
       

          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white text-center">
            <label className="text-sm font-bold text-gray-700 block mb-2">Student&apos;s Image / සිසුවාගේ ඡායාරූපය *</label>
            <input type="file" accept="image/*" required onChange={(e) => setImage(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
            {image && <p className="mt-2 text-green-600 text-xs">Selected: {image.name}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#800000] text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition shadow-lg text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (isSi ? "සුරකිමින්..." : "Saving...") : (isSi ? "ලියාපදිංචි කිරීම සුරකින්න" : "Submit Registration")}
          </button>
        </form>
      </div>
    </main>
  );
}