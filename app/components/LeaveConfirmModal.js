// components/LeaveConfirmModal.js
import React, { useEffect, useMemo, useState } from 'react';

const FINAL_EXAM_SUBJECTS = [
  {
    key: 'Buddha Charithay',
    si: 'බුද්ධ චරිතය',
    en: 'Buddha Charithay'
  },
  {
    key: 'Buddha Sanskruthiya',
    si: 'බුද්ධ සංස්කෘතිය',
    en: 'Buddha Sanskruthiya'
  },
  {
    key: 'Pali Abhidharma',
    si: 'පාලි අභිධර්මය',
    en: 'Pali Abhidharma'
  },
  {
    key: 'Shasana Ithihasaya',
    si: 'ශාසන ඉතිහාසය',
    en: 'Shasana Ithihasaya'
  }
];

export default function LeaveConfirmModal({ isOpen, onClose, onConfirm, studentName, currentGrade, lang }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [leaveReasonType, setLeaveReasonType] = useState('');
  const [otherLeaveReason, setOtherLeaveReason] = useState('');
  const [documentImages, setDocumentImages] = useState([]);
  const [facedFinalExam, setFacedFinalExam] = useState(false);
  const [finalExamResults, setFinalExamResults] = useState(() =>
    FINAL_EXAM_SUBJECTS.reduce((accumulator, subject) => {
      accumulator[subject.key] = '';
      return accumulator;
    }, {})
  );

  const gradeNumber = Number(currentGrade);
  const isGrade11 = useMemo(() => gradeNumber === 11, [gradeNumber]);

  useEffect(() => {
    if (isOpen) {
      setLeaveReasonType('');
      setOtherLeaveReason('');
      setDocumentImages([]);
      setFacedFinalExam(false);
      setFinalExamResults(
        FINAL_EXAM_SUBJECTS.reduce((accumulator, subject) => {
          accumulator[subject.key] = '';
          return accumulator;
        }, {})
      );
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const isSi = lang === 'si';
  const resolvedLeaveReason = leaveReasonType === 'other' ? otherLeaveReason.trim() : leaveReasonType;

  const handleResultChange = (subject, value) => {
    setFinalExamResults((previousResults) => ({
      ...previousResults,
      [subject]: value
    }));
  };

  const handleConfirmClick = async () => {
    if (!resolvedLeaveReason) {
      return;
    }

    setIsDeleting(true);

    try {
      await onConfirm({
        leaveReasonType,
        leaveReason: resolvedLeaveReason,
        documentImages,
        currentGrade: gradeNumber || currentGrade,
        facedFinalExam: isGrade11 ? facedFinalExam : false,
        finalExamResults: isGrade11 && facedFinalExam ? finalExamResults : {}
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
        
        <div className="p-6 text-left">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {isSi ? "අස්වීම ස්ථිර කරන්න" : "Confirm Leaving"}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            {isSi 
              ? `ඔබ ඇත්තටම ${studentName} ශිෂ්‍යා පද්ධතියෙන් ඉවත් කිරීමට (Leave) අවශ්‍යද? මෙය ආපසු හැරවිය නොහැක.` 
              : `Are you sure you want to mark ${studentName} as left from the system? This action is permanent.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                {isSi ? "වර්තමාන ශ්‍රේණිය" : "Current Grade"}
              </label>
              <input
                type="text"
                value={currentGrade ?? '-'}
                readOnly
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">
                {isSi ? "අදාළ ලේඛන ඡායාරූප" : "Related Document Images"}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setDocumentImages(Array.from(e.target.files || []))}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
              />
              {documentImages.length > 0 && (
                <p className="mt-1 text-xs text-green-700">
                  {isSi
                    ? `ඡායාරූප ${documentImages.length} තෝරා ඇත`
                    : `${documentImages.length} image(s) selected`}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-bold text-gray-700 mb-2 block">
              {isSi ? "ඉවත් වීමට හේතුව" : "Reason for Leave"}
            </label>
            <div className="space-y-3 rounded-lg border border-gray-200 p-4 bg-gray-50">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="leaveReason"
                  value="End of the period"
                  checked={leaveReasonType === 'End of the period'}
                  onChange={(e) => setLeaveReasonType(e.target.value)}
                  className="h-4 w-4"
                />
                {isSi ? "කාල සීමාව අවසන් වීම" : "End of the period"}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="leaveReason"
                  value="Change the residence"
                  checked={leaveReasonType === 'Change the residence'}
                  onChange={(e) => setLeaveReasonType(e.target.value)}
                  className="h-4 w-4"
                />
                {isSi ? "පදිංචිය වෙනස් වීම" : "Change the residence"}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="leaveReason"
                  value="other"
                  checked={leaveReasonType === 'other'}
                  onChange={(e) => setLeaveReasonType(e.target.value)}
                  className="h-4 w-4"
                />
                {isSi ? "වෙනත්" : "Other"}
              </label>

              {leaveReasonType === 'other' && (
                <input
                  type="text"
                  value={otherLeaveReason}
                  onChange={(e) => setOtherLeaveReason(e.target.value)}
                  placeholder={isSi ? "වෙනත් හේතුව සඳහන් කරන්න" : "Enter other reason"}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-gray-700 bg-white"
                />
              )}
            </div>
          </div>

          {isGrade11 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={facedFinalExam}
                  onChange={(e) => setFacedFinalExam(e.target.checked)}
                  className="h-4 w-4"
                />
                {isSi ? "අවසන් විභාගයට පෙනී සිටියාද?" : "Faced Final Exam"}
              </label>

              {facedFinalExam && (
                <div className="mt-3">
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    {isSi ? "විෂය අනුව ප්‍රතිඵල" : "Results By Subject"}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FINAL_EXAM_SUBJECTS.map((subject) => (
                      <div key={subject.key}>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">
                          {isSi ? subject.si : subject.en}
                        </label>
                        <input
                          type="text"
                          value={finalExamResults[subject.key] || ''}
                          onChange={(e) => handleResultChange(subject.key, e.target.value)}
                          placeholder={isSi ? "ප්‍රතිඵලය" : "Result"}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-gray-700 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-100 transition active:scale-95 disabled:opacity-50"
          >
            {isSi ? "නැත" : "No, Cancel"}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={isDeleting || !resolvedLeaveReason}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting 
              ? (isSi ? "ඉවත් කරමින්..." : "Processing...") 
              : (isSi ? "ඔව්, සුරකින්න" : "Yes, Save Leave")}
          </button>
        </div>
      </div>
    </div>
  );
}