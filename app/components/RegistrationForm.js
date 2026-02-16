// components/RegistrationForm.js
export default function RegistrationForm({ lang }) {
  const isSi = lang === 'si';

  return (
    <main className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-[#F3F4F6] (gray-100) p-6 md:p-10 rounded-2xl shadow-xl border border-gray-200">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            {isSi ? "ශිෂ්‍ය ලියාපදිංචි කිරීමේ පෝරමය" : "Student Registration Form"}
          </h2>
          <p className="text-gray-500 text-sm italic">
            {isSi ? "* සලකුණු කර ඇති සියලුම තොරතුරු අනිවාර්ය වේ" : "* All marked fields are required"}
          </p>
        </div>

        <form className="space-y-8">
          
          {/* Section 1: මූලික තොරතුරු / Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Admission No / ඇතුලත් වීමේ අංකය *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Admission Date / ඇතුලත් වූ දිනය *</label>
              <input type="date" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2">Full Name / සම්පූර්ණ නම *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Birth Day / උපන්දිනය *</label>
              <input type="date" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Admitted Grade (2026) / ඇතුලත් වන ශ්‍රේණිය *</label>
              <select required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white">
                <option value="">Select Grade</option>
                {[...Array(13)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: ලිපිනයන් / Address */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Permanent Address / ස්ථිර ලිපිනය *</label>
              <textarea rows="2" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"></textarea>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Current Address / පදිංචි ලිපිනය *</label>
              <textarea rows="2" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"></textarea>
            </div>
          </div>

          {/* Section 3: දෙමාපිය තොරතුරු / Parents Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-200/50 p-4 rounded-lg">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Mother&apos;s Name / මවගේ නම *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Mother&apos;s T.P / මවගේ දුරකථන අංකය *</label>
              <input type="tel" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Father&apos;s Name / පියාගේ නම *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Father&apos;s T.P / පියාගේ දුරකථන අංකය *</label>
              <input type="tel" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Guardian&apos;s Name / භාරකරුගේ නම *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Guardian&apos;s T.P / භාරකරුගේ දුරකථන අංකය *</label>
              <input type="tel" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
          </div>

          {/* Section 4: අනෙකුත් තොරතුරු / Others */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-bold text-gray-700 mb-2">School Name / ඉගෙනුම ලබ‍න පාසලේ නම *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Parent/Guardian Occupation / රැකියාව *</label>
              <input type="text" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-2">Distance to Home / නිවසට ඇති දුර *</label>
              <input type="text" placeholder="e.g. 2km" required className="p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white" />
            </div>
          </div>

          {/* Image Upload */}
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white text-center">
            <label className="text-sm font-bold text-gray-700 block mb-2">Student&apos;s Image / සිසුවාගේ ඡායාරූපය *</label>
            <input type="file" accept="image/*" required className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
            <p className="text-xs text-gray-400 mt-2">Supported: JPG, PNG. Max 100MB.</p>
          </div>

          {/* Submit */}
          <button type="submit" className="w-full bg-[#800000] text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition shadow-lg text-lg">
            {isSi ? "ලියාපදිංචි කිරීම සුරකින්න" : "Submit Registration"}
          </button>
        </form>
      </div>
    </main>
  );
}