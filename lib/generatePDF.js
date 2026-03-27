export const generateStudentProfilePDF = (student, lang, registeredBy, lastUpdateBy) => {
  const isSi = lang === 'si';
  const printWindow = window.open('', '_blank');
  const isActive = student.status === 'Active';
  const isAdmissionPaymentDone = Boolean(student.admissionPaymentDone);
  
  const htmlContent = `
    <html>
    <head>
      <title>Student Profile - ${student.admissionNo}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 30px 20px; margin: 0;
          color: #333; 
          line-height: 1.5;
        }

        /* Letterhead Styles */
        .letterhead { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          border-bottom: 2px solid #800000; 
          padding-bottom: 15px; 
          margin-bottom: 25px; 
        }
        .logo { width: 80px; height: 80px; object-fit: contain; }
        .school-info { text-align: center; flex: 1; }
        .school-info h1 { margin: 0; color: #800000; font-size: 24px; font-weight: bold; }
        .school-info p { margin: 2px 0; font-size: 15px; font-weight: 600; }
        .school-info small { color: #555; font-size: 13px; }

        .report-title { 
          text-align: center; font-size: 18px; text-transform: uppercase; 
          margin-bottom: 25px; font-weight: bold; background: #f4f4f4;
          padding: 8px; border-radius: 4px; border: 1px solid #ddd;
        }

        .content-layout { display: flex; gap: 30px; }
        .details-section { flex: 3; }
        
        /* Photo Section Styles */
        .photo-section { flex: 1; text-align: center; }
        .student-photo { 
          width: 140px; height: 160px; border: 2px solid #800000; 
          object-fit: cover; border-radius: 4px; 
        }
        .photo-admission-no {
          margin-top: 8px;
          font-size: 12px;
          color: #800000;
        }

        .admission-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid transparent;
          letter-spacing: 0.3px;
        }

        .tag-green {
          background: #dcfce7;
          color: #166534;
          border-color: #bbf7d0;
        }

        .tag-red {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fecaca;
        }

        /* Table Styles */
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table td { padding: 8px 5px; border-bottom: 1px solid #eee; vertical-align: top; }
        .label { font-weight: bold; color: #555; width: 40%; font-size: 13px; }
        .value { color: #000; font-size: 13px; }
        
        .section-header { 
          background: #800000; color: white; padding: 4px 12px; 
          font-size: 13px; margin-top: 15px; border-radius: 2px; font-weight: bold;
        }

        /* Notes and Signatures */
        .admin-section { margin-top: 10px; }
        .notes-area { 
          border: 1px solid #ccc; height: 60px; margin-top: 10px; 
          padding: 10px; font-size: 12px; color: #999; border-radius: 4px;
        }
        
        .signature-grid { 
          display: flex; justify-content: space-between; margin-top: 40px; 
        }
        .sig-box { text-align: center; width: 200px; }
        .sig-box2 { text-align: center; width: 200px; margin-top: 20px; }
        .sig-line { border-top: 1.5px solid #333; margin-bottom: 5px; }
        .sig-text { font-size: 13px; font-weight: bold; }

        .footer-meta { 
          margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; 
          font-size: 10px; color: #888; display: flex; justify-content: space-between; 
        }

        @media print {
          body { padding: 10px; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="letterhead">
        <img src="/images/pansala.jpeg" class="logo" alt="Pansala Logo">
        <div class="school-info">
          <h1>ශ්‍රී සද්ධර්මවර්ධන දහම් පාසල</h1>
          <p>Sri Saddharmawardhana Dhamma School</p>
          <small>අස්ගිරිය, මහනුවර</small>
        </div>
        <img src="/images/dahampasala.png" class="logo" alt="Dahampasala Logo">
      </div>

      <div class="report-title">
        ${isSi ? 'ශිෂ්‍ය තොරතුරු වාර්තාව' : 'Student Profile Report'}
      </div>

      <div class="content-layout">
        <div class="details-section">
          <table class="info-table">
            <tr>
              <td class="label">ඇතුලත් වීමේ අංකය / Admission No</td>
              <td class="value">
                <div class="admission-row">
                  <strong>${student.admissionNo}</strong>
                  <span class="tag ${isAdmissionPaymentDone ? 'tag-green' : 'tag-red'}">
                    ${isAdmissionPaymentDone
                      ? (isSi ? 'ඇතුළත් වීමේ ගාස්තු ගෙවා ඇත' : 'Admission Payment Done')
                      : (isSi ? 'ඇතුළත් වීමේ ගාස්තු ගෙවා නැත' : 'Admission Payment Pending')}
                  </span>
                </div>
              </td>
            </tr>
          </table>

          <table class="info-table">
            <tr><td class="label">සම්පූර්ණ නම / Full Name</td><td colspan="4" class="value">${student.fullName}</td></tr>
            <tr><td  class="label">ඇතුලත් වූ ශ්‍රේණිය / Admitted Grade</td><td class="value">${student.admittedGrade}</td>
            <td class="label">වත්මන් ශ්‍රේණිය / Current Grade</td><td class="value">${student.currentGrade}</td></tr>

            <tr><td class="label">පාසල / School Name</td><td colspan="4"  class="value">${student.school}</td></tr>
            <tr><td class="label">ස්ථිර ලිපිනය / Permanent Address</td><td colspan="4" class="value">${student.permanentAddr}</td></tr>
            <tr><td class="label">වත්මන් ලිපිනය / Current Address</td><td colspan="4" class="value">${student.currentAddr}</td></tr>
          </table>
          <table class="info-table">
            <tr>
              <td class="label">මවගේ නම සහ දුරකථනය <br> Mother's Name & Contact</td>
              <td class="value">${student.mother} ${student.motherTP ? ' - (' + student.motherTP + ')' : ''}</td>
            </tr>
            <tr>
              <td class="label">පියාගේ නම සහ දුරකථනය <br> Father's Name & Contact</td>
              <td class="value">${student.father} ${student.fatherTP ? ' - (' + student.fatherTP + ')' : ''}</td>
            </tr>
            <tr>
              <td class="label">භාරකරුගේ නම, දුරකථනය සහ රැකියාව <br> Guardian's Name, Contact & Occupation</td>
              <td class="value">${student.guardianName || '-'} ${student.guardianTP ? ' - (' + student.guardianTP + ')' : '-'} ${student.occupation || '-'}</td>
            </tr>
          
          </table>

          ${!isActive && student.leftDate ? `
            <table class="info-table">
              <tr>
                <td class="label">${isSi ? 'ඉවත් වූ දිනය / Leave Date' : 'Leave Date'}</td>
                <td class="value">${new Date(student.leftDate).toLocaleDateString(isSi ? 'si-LK' : 'en-US')}</td>
              </tr>
              <tr>
                <td class="label">${isSi ? 'ඉවත් වීමේ හේතුව / Leave Reason' : 'Reason for Leave'}</td>
                <td class="value">${student.leaveReason || '-'}</td>
              </tr>
            </table>
          ` : ''}
        </div>

        <div class="photo-section">
          ${student.imageUrl 
            ? `<img src="${student.imageUrl}" class="student-photo">` 
            : `<div style="width:140px; height:160px; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999; margin: 0 auto;">No Photo</div>`
          }
            <div class="photo-admission-no">Student No: ${student.studentNo}</div>
            <div style="margin-top: 10px;">
              <span class="tag ${isActive ? 'tag-green' : 'tag-red'}">
                ${isActive ? (isSi ? 'අධ්‍යාපනය ලබයි' : 'Active') : (isSi ? 'ඉවත් වී ඇත' : 'Inactive')}
              </span>
            </div>
        </div>
       
      </div>

      <div class="admin-section">
        <div style="font-size:13px; font-weight:bold;">${isSi ? 'විශේෂ සටහන් (Notes):' : 'Special Notes:'}</div>
        <div class="notes-area"></div>

        <div class="signature-grid">
          <div class="sig-box">
            <div class="sig-date" style="font-size:13px;">${new Date().toLocaleDateString()}</div>
            <div class="sig-line"></div>
            <div class="sig-text">${isSi ? 'දිනය' : 'Date'}</div>
          </div>
          <div class="sig-box2">
            <div class="sig-line"></div>
            <div class="sig-text">${isSi ? 'විදුහල්පති අත්සන' : "Principal's Signature"}</div>
          </div>
        </div>
      </div>

      <div class="footer-meta">
        <span>Generated By: ${registeredBy}</span>
        <span>Last Update: ${lastUpdateBy}</span>
        <span>Printed Date: ${new Date().toLocaleDateString()}</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

const buildStudentPageHtml = (student, lang, generatedBy, printedDate) => {
  const isSi = lang === 'si';
  const isActive = student.status === 'Active';
  const isAdmissionPaymentDone = Boolean(student.admissionPaymentDone);

  return `
    <div class="student-page">
      <div class="letterhead">
        <img src="/images/pansala.jpeg" class="logo" alt="Pansala Logo">
        <div class="school-info">
          <h1>ශ්‍රී සද්ධර්මවර්ධන දහම් පාසල</h1>
          <p>Sri Saddharmawardhana Dhamma School</p>
          <small>අස්ගිරිය, මහනුවර</small>
        </div>
        <img src="/images/dahampasala.png" class="logo" alt="Dahampasala Logo">
      </div>

      <div class="report-title">
        ${isSi ? 'ශිෂ්‍ය තොරතුරු වාර්තාව' : 'Student Profile Report'}
      </div>

      <div class="content-layout">
        <div class="details-section">
          <table class="info-table">
            <tr>
              <td class="label">ඇතුලත් වීමේ අංකය / Admission No</td>
              <td class="value">
                <div class="admission-row">
                  <strong>${student.admissionNo || '-'}</strong>
                  <span class="tag ${isAdmissionPaymentDone ? 'tag-green' : 'tag-red'}">
                    ${isAdmissionPaymentDone
                      ? (isSi ? 'ඇතුළත් වීමේ ගාස්තු ගෙවා ඇත' : 'Admission Payment Done')
                      : (isSi ? 'ඇතුළත් වීමේ ගාස්තු ගෙවා නැත' : 'Admission Payment Pending')}
                  </span>
                </div>
              </td>
            </tr>
          </table>

          <table class="info-table">
            <tr><td class="label">සම්පූර්ණ නම / Full Name</td><td colspan="4" class="value">${student.fullName || '-'}</td></tr>
            <tr><td  class="label">ඇතුලත් වූ ශ්‍රේණිය / Admitted Grade</td><td class="value">${student.admittedGrade || '-'}</td>
            <td class="label">වත්මන් ශ්‍රේණිය / Current Grade</td><td class="value">${student.currentGrade || '-'}</td></tr>
            <tr><td class="label">පාසල / School Name</td><td colspan="4"  class="value">${student.school || '-'}</td></tr>
            <tr><td class="label">ස්ථිර ලිපිනය / Permanent Address</td><td colspan="4" class="value">${student.permanentAddr || '-'}</td></tr>
            <tr><td class="label">වත්මන් ලිපිනය / Current Address</td><td colspan="4" class="value">${student.currentAddr || '-'}</td></tr>
          </table>

          <table class="info-table">
            <tr>
              <td class="label">මවගේ නම සහ දුරකථනය <br> Mother's Name & Contact</td>
              <td class="value">${student.mother || '-'} ${student.motherTP ? ' - (' + student.motherTP + ')' : ''}</td>
            </tr>
            <tr>
              <td class="label">පියාගේ නම සහ දුරකථනය <br> Father's Name & Contact</td>
              <td class="value">${student.father || '-'} ${student.fatherTP ? ' - (' + student.fatherTP + ')' : ''}</td>
            </tr>
            <tr>
              <td class="label">භාරකරුගේ නම, දුරකථනය සහ රැකියාව <br> Guardian's Name, Contact & Occupation</td>
              <td class="value">${student.guardianName || '-'} ${student.guardianTP ? ' - (' + student.guardianTP + ')' : '-'} ${student.occupation || '-'}</td>
            </tr>
          </table>

          ${!isActive && student.leftDate ? `
            <table class="info-table">
              <tr>
                <td class="label">${isSi ? 'ඉවත් වූ දිනය / Leave Date' : 'Leave Date'}</td>
                <td class="value">${new Date(student.leftDate).toLocaleDateString(isSi ? 'si-LK' : 'en-US')}</td>
              </tr>
              <tr>
                <td class="label">${isSi ? 'ඉවත් වීමේ හේතුව / Leave Reason' : 'Reason for Leave'}</td>
                <td class="value">${student.leaveReason || '-'}</td>
              </tr>
            </table>
          ` : ''}
        </div>

        <div class="photo-section">
          ${student.imageUrl
            ? `<img src="${student.imageUrl}" class="student-photo">`
            : `<div style="width:140px; height:160px; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999; margin: 0 auto;">No Photo</div>`
          }
          <div class="photo-admission-no">Student No: ${student.studentNo || '-'}</div>
          <div style="margin-top: 10px;">
            <span class="tag ${isActive ? 'tag-green' : 'tag-red'}">
              ${isActive ? (isSi ? 'සක්‍රියයි' : 'Active') : (isSi ? 'අක්‍රියයි' : 'Inactive')}
            </span>
          </div>
        </div>
      </div>

      <div class="admin-section">
        <div style="font-size:13px; font-weight:bold;">${isSi ? 'විශේෂ සටහන් (Notes):' : 'Special Notes:'}</div>
        <div class="notes-area"></div>

        <div class="signature-grid">
          <div class="sig-box">
            <div class="sig-date" style="font-size:13px;">${printedDate}</div>
            <div class="sig-line"></div>
            <div class="sig-text">${isSi ? 'දිනය' : 'Date'}</div>
          </div>
          <div class="sig-box2">
            <div class="sig-line"></div>
            <div class="sig-text">${isSi ? 'විදුහල්පති අත්සන' : "Principal's Signature"}</div>
          </div>
        </div>
      </div>

      <div class="footer-meta">
        <span>Generated By: ${generatedBy}</span>
        <span>Last Update: ${student.editedBy || generatedBy}</span>
        <span>Printed Date: ${printedDate}</span>
      </div>
    </div>
  `;
};

export const generateAllStudentsPDF = (students, lang, generatedBy) => {
  if (!Array.isArray(students) || students.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printedDate = new Date().toLocaleDateString();
  const pagesHtml = students.map((student) => buildStudentPageHtml(student, lang, generatedBy, printedDate)).join('');

  const htmlContent = `
    <html>
    <head>
      <title>${lang === 'si' ? 'සියලු ශිෂ්‍ය වාර්තා' : 'All Student Reports'}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 0;
          margin: 0;
          color: #333;
          line-height: 1.5;
        }

        .student-page {
          padding: 40px;
          page-break-after: always;
        }

        .student-page:last-child {
          page-break-after: auto;
        }

        .letterhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #800000;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }

        .logo { width: 80px; height: 80px; object-fit: contain; }
        .school-info { text-align: center; flex: 1; }
        .school-info h1 { margin: 0; color: #800000; font-size: 24px; font-weight: bold; }
        .school-info p { margin: 2px 0; font-size: 15px; font-weight: 600; }
        .school-info small { color: #555; font-size: 13px; }

        .report-title {
          text-align: center;
          font-size: 18px;
          text-transform: uppercase;
          margin-bottom: 25px;
          font-weight: bold;
          background: #f4f4f4;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .content-layout { display: flex; gap: 30px; }
        .details-section { flex: 3; }
        .photo-section { flex: 1; text-align: center; }
        .student-photo {
          width: 140px;
          height: 160px;
          border: 2px solid #800000;
          object-fit: cover;
          border-radius: 4px;
        }
        .photo-admission-no {
          margin-top: 8px;
          font-weight: bold;
          font-size: 14px;
          color: #800000;
        }

        .admission-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid transparent;
          letter-spacing: 0.3px;
        }

        .tag-green {
          background: #dcfce7;
          color: #166534;
          border-color: #bbf7d0;
        }

        .tag-red {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fecaca;
        }

        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table td { padding: 8px 5px; border-bottom: 1px solid #eee; vertical-align: top; }
        .label { font-weight: bold; color: #555; width: 40%; font-size: 13px; }
        .value { color: #000; font-size: 13px; }

        .section-header {
          background: #800000;
          color: white;
          padding: 4px 12px;
          font-size: 13px;
          margin-top: 15px;
          border-radius: 2px;
          font-weight: bold;
        }

        .admin-section { margin-top: 10px; }
        .notes-area {
          border: 1px solid #ccc;
          height: 60px;
          margin-top: 10px;
          padding: 10px;
          font-size: 12px;
          color: #999;
          border-radius: 4px;
        }

        .signature-grid {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        .sig-box { text-align: center; width: 200px; }
        .sig-box2 { text-align: center; width: 200px; margin-top: 20px; }
        .sig-line { border-top: 1.5px solid #333; margin-bottom: 5px; }
        .sig-text { font-size: 13px; font-weight: bold; }

        .footer-meta {
          margin-top: 30px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
          font-size: 10px;
          color: #888;
          display: flex;
          justify-content: space-between;
        }

        @media print {
          .student-page { padding: 10px; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); }, 700);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};