import bgyLogo from "../assets/bgylogo.png"; 

export const usePrinter = () => {
  const printTable = (title, columns, data, filterName = "All") => {
    if (!data || data.length === 0) {
      return alert("No records to print.");
    }

    const printWindow = window.open('', '_blank');

    const isLandscape = columns.length >= 7;
    const isLargeData = data.length > 25;
    const fontSize = isLargeData ? "8px" : "9px";
    const headerFontSize = isLargeData ? "12px" : "14px";

    const tableHeaders = columns.map(col => `
      <th style="width:${col.width || 'auto'}; text-align:${col.align || 'left'};">
        ${col.header}
      </th>
    `).join('');

    const tableRows = data.map((item, index) => `
      <tr>
        ${columns.map(col => {
          let value = col.key === "no" ? (index + 1) : item[col.key];
          return `
            <td style="text-align:${col.align || 'left'};">
              ${value ?? ""}
            </td>
          `;
        }).join('')}
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page {
                size: ${isLandscape ? "A4 landscape" : "A4 portrait"};
                margin: 10mm;
              }
              body { margin: 0; }
              .page-footer {
                position: fixed;
                bottom: 0;
                right: 0;
                font-size: 8px;
              }
              .page-footer::after { content: "Page " counter(page); }
            }

            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: ${fontSize};
              color: #000;
              padding: 20px;
              counter-reset: page;
            }

            .header { text-align: center; margin-bottom: 20px; position: relative; }
            .header img { width: 75px; height: auto; margin-bottom: 5px; }
            .header p { margin: 1px 0; font-size: 10px; text-transform: uppercase; }
            .header .lgu-info { margin-bottom: 10px; }
            .header h1 { 
              margin: 10px 0; 
              font-size: ${headerFontSize}; 
              text-transform: uppercase; 
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 5px 0;
            }

            .info-bar { 
              display: flex; 
              justify-content: space-between; 
              font-size: 9px; 
              margin-bottom: 10px; 
              font-style: italic; 
            }

            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              word-wrap: break-word;
              vertical-align: middle;
            }
            th { background: #f2f2f2 !important; -webkit-print-color-adjust: exact; font-weight: bold; }

            .footer-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .sign-box { width: 30%; text-align: center; }
            .sign-line {
              margin-top: 35px;
              border-top: 1px solid #000;
              padding-top: 5px;
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); }, 800);">
          <div class="header">
            <img src="${bgyLogo}" alt="Barangay Gulod Logo" />
            <div class="lgu-info">
              <p>Republic of the Philippines</p>
              <p>District 5, Quezon City</p>
              <p>Novaliches</p>
              <p><strong>Barangay Gulod</strong></p>
            </div>
            <h1>${title}</h1>
          </div>

          <div class="info-bar">
            <span>Filters: ${filterName}</span>
            <span>Date: ${new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>

          <div style="margin-top: 15px; font-weight: bold;">
            Total Records: ${data.length}
          </div>

          <div class="footer-section">
            <div class="sign-box"><div class="sign-line">Prepared by</div></div>
            <div class="sign-box"><div class="sign-line">Verified by</div></div>
            <div class="sign-box"><div class="sign-line">Barangay Captain</div></div>
          </div>
          <div class="page-footer"></div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // For Official Certificates (Clearance, Indigency, etc.)
  const printCertificate = (resident, certType) => {
    const printWindow = window.open('', '_blank');
    const dateToday = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>${certType} - ${resident.name}</title>
          <style>
            @page { 
              size: portrait; 
              margin: 0; 
            }
            
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0;
              padding: 0;
              background-color: #f1f5f9; /* Light gray to see the paper in browser */
            }

            .page-container {
              width: 8.5in;
              height: 11in;
              margin: 0 auto;
              padding: 0.5in;
              box-sizing: border-box;
              background-color: white;
              display: flex;
              flex-direction: column;
            }

            .content-border {
              border: 4px double #000;
              padding: 40px;
              height: 100%;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              position: relative;
            }

            .header { text-align: center; margin-bottom: 25px; }
            .header h2 { margin: 0; font-size: 14px; text-transform: uppercase; font-weight: normal; }
            .header h1 { margin: 2px 0; font-size: 22px; color: #065f46; text-transform: uppercase; font-weight: bold; }
            .header p { margin: 0; font-size: 12px; font-style: italic; }

            .cert-title { 
              text-align: center; 
              font-size: 28px; 
              font-weight: bold; 
              text-decoration: underline; 
              margin: 45px 0; 
              text-transform: uppercase; 
            }

            .body-content {
              flex: 1;
            }

            .body-text { 
              font-size: 17px; 
              text-align: justify; 
              margin-bottom: 25px; 
              text-indent: 50px;
              line-height: 1.6;
            }

            .salutation {
              font-size: 17px;
              font-weight: bold;
              margin-bottom: 25px;
            }

            .footer-section {
              margin-top: auto;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-bottom: 10px;
            }

            .sig-box { text-align: center; width: 250px; }
            .sig-name { 
              font-weight: bold; 
              font-size: 18px; 
              border-bottom: 1px solid #000; 
              text-transform: uppercase; 
              margin-bottom: 2px;
            }
            .sig-title { font-size: 13px; margin: 0; }

            .watermark { 
              position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%) rotate(-45deg); 
              opacity: 0.05; 
              font-size: 80px; 
              font-weight: bold; 
              pointer-events: none; 
              width: 100%;
              text-align: center;
              z-index: 0;
            }

            @media print {
              body { background-color: white; }
              .page-container { margin: 0; width: 100%; height: 100vh; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body onload="window.print();">
          <div class="page-container">
            <div class="content-border">
              <div class="watermark">OFFICIAL DOCUMENT</div>
              
              <div class="header">
                <h2>Republic of the Philippines</h2>
                <h2>Province of Example</h2>
                <h1>Barangay Gulod</h1>
                <p>Office of the Barangay Captain</p>
              </div>

              <div class="cert-title">${certType}</div>

              <div class="body-content">
                <div class="salutation">TO WHOM IT MAY CONCERN:</div>
                
                <div class="body-text">
                  This is to certify that <b>${resident.name.toUpperCase()}</b>, of legal age, 
                  is a bonafide resident of <b>Purok ${resident.purok}, Barangay Gulod</b>.
                </div>

                <div class="body-text">
                  According to our records (Record of Inhabitants), the above-named person has no derogatory record filed 
                  in this office and is known to be a law-abiding citizen with good moral character.
                </div>

                <div class="body-text">
                  This certification is issued upon the request of the above-named person for 
                  <b>${certType === 'First Time Jobseeker (RA 11261)' ? 'FIRST TIME JOB SEEKING' : 'GENERAL PURPOSES'}</b> 
                  and for whatever legal purpose this may serve.
                </div>

                <div class="body-text">
                  Issued this <b>${dateToday}</b> at the Office of the Barangay Captain, 
                  Barangay Gulod.
                </div>
              </div>

              <div class="footer-section">
                <div class="sig-box" style="text-align: left;">
                  <p style="font-size: 11px; margin-bottom: 45px;">Thumbmark/Signature:</p>
                  <div style="border-bottom: 1px solid #000; width: 160px;"></div>
                </div>
                
                <div class="sig-box">
                  <div class="sig-name">HON. JUAN DELA CRUZ</div>
                  <p class="sig-title">Punong Barangay</p>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return { printTable, printCertificate };
};