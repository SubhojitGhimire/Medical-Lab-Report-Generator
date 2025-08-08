const UIManager = {
    renderHomePage: function() {
        return `
            <div class="home-container">
                <h2>Welcome to the Lab Portal</h2>
                <p>Please select an option to begin.</p>
                <div class="home-actions">
                    <button id="btn-new-patient" class="btn btn-primary"><span class="icon">➕</span> Register New Patient</button>
                    <button id="btn-existing-patient" class="btn btn-secondary"><span class="icon">🔍</span> Continue with Existing Patient</button>
                </div>
            </div>
        `;
    },

    renderNewPatientForm: function() {
        return `
            <div class="form-container">
                <div class="form-header">
                    <h2>New Patient Registration</h2>
                    <button id="btn-back-to-home" class="btn-back">← Back to Home</button>
                </div>
                <form id="new-patient-form">
                    <div class="form-group"><label for="patient-name">Full Name</label><input type="text" id="patient-name" required></div>
                    <div class="form-group"><label for="patient-dob">Date of Birth</label><input type="date" id="patient-dob" required></div>
                    <div class="form-group"><label for="patient-gender">Gender</label><select id="patient-gender" required><option value="">--Please choose an option--</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                    <div class="form-group"><label for="patient-address">Address</label><input type="text" id="patient-address"></div>
                    <div class="form-group"><label for="patient-phone">Phone Number</label><input type="tel" id="patient-phone"></div>
                    <div class="form-actions"><button type="submit" class="btn btn-primary"><span class="icon">💾</span> Save Patient</button></div>
                </form>
            </div>
        `;
    },

    renderPatientSearchPage: function(patients) {
        let patientListHTML = '<p>No patients found. Register a new patient to begin.</p>';
        if (patients.length > 0) {
            patientListHTML = patients.map(p => `
                <li class="patient-list-item" data-filename="${p.filename}" tabindex="0">
                    <div class="patient-info"><strong class="patient-name">${p.name}</strong><span class="patient-id">ID: ${p.id}</span></div>
                </li>
            `).join('');
        }
        return `
            <div class="search-container">
                <div class="form-header"><h2>Find Existing Patient</h2><button id="btn-back-to-home" class="btn-back">← Back to Home</button></div>
                <div class="search-bar-container"><input type="search" id="patient-search-input" placeholder="Search by name or ID..."></div>
                <ul id="patient-list">${patientListHTML}</ul>
            </div>
        `;
    },
    
    renderPatientRecordsPage: function(records) {
        const patientInfo = records[0];
        const labReports = records.slice(1);
        const patientAge = Utils.calculateAge(patientInfo.dob);
        let reportsHTML = `<div class="no-records">No past reports found for this patient.</div>`;
        if (labReports.length > 0) {
            reportsHTML = labReports.map((report, index) => {
                return `
                <div class="record-item">
                    <span>Report from: ${new Date(report.date).toLocaleDateString()}</span>
                    <span>Investigation: ${report.investigation}</span>
                    <div class="record-actions"><button class="btn-icon" data-record-index="${index + 1}">✏️ View/Edit</button></div>
                </div>
            `}).join('');
        }
        return `
            <div class="patient-records-container">
                <div class="patient-details-header">
                    <div class="detail-item"><strong>Name:</strong> ${patientInfo.name}</div>
                    <div class="detail-item"><strong>ID:</strong> ${patientInfo.patientID}</div>
                    <div class="detail-item"><strong>Age/Sex:</strong> ${patientAge}Y / ${patientInfo.gender}</div>
                    <div class="detail-item"><strong>Phone:</strong> ${patientInfo.phone}</div>
                    <div class="detail-item detail-full-width"><strong>Address:</strong> ${patientInfo.address}</div>
                </div>
                <div class="records-section">
                     <div class="form-header"><h3>Patient History</h3><button id="btn-back-to-search" class="btn-back">← Back to Search</button></div>
                     <div class="records-list">${reportsHTML}</div>
                     <div class="form-actions"><button id="btn-new-record" class="btn btn-primary"><span class="icon">➕</span> Create New Record</button></div>
                </div>
            </div>
        `;
    },
    
    renderNewRecordModal: function() {
        return `
            <div id="modal-backdrop">
                <div id="modal-content" class="form-container">
                    <h3>New Report Details</h3>
                    <form id="new-record-meta-form">
                        <div class="form-group"><label for="referred-by">Referred By</label><input type="text" id="referred-by" value="SELF"></div>
                        <div class="form-group"><label for="investigation-requested">Investigation Requested For</label><input type="text" id="investigation-requested" required></div>
                        <div class="form-actions"><button type="button" id="btn-modal-cancel" class="btn btn-secondary">Cancel</button><button type="submit" class="btn btn-primary">Continue</button></div>
                    </form>
                </div>
            </div>
        `;
    },

    renderReportView: function(patientInfo, report) {
        const groupedResults = {};
        for (const compositeKey in report.results) {
            const resultValue = report.results[compositeKey];
            const [category, sub_category, testName] = compositeKey.split('|');
            const testDef = DataManager.flatTestMap[testName] || {};
            const subCatKey = sub_category || 'General';
            if (!groupedResults[category]) groupedResults[category] = {};
            if (!groupedResults[category][subCatKey]) groupedResults[category][subCatKey] = [];

            groupedResults[category][subCatKey].push({ 
                test_name: testName,
                result: resultValue,
                normal_values: testDef.normal_values || '---'
            });
        }

        const resultsHTML = Object.keys(groupedResults).map(category => {
            const subCategoriesHTML = Object.keys(groupedResults[category]).map(subCat => {
                const testsHTML = groupedResults[category][subCat].map(test => `
                    <tr>
                        <td>${test.test_name}</td>
                        <td>${test.result}</td>
                        <td>${test.normal_values}</td>
                    </tr>
                `).join('');
                return `<h4>${subCat}</h4><table class="results-table"><thead><tr><th>Test Name</th><th>Result</th><th>Normal Value</th></tr></thead><tbody>${testsHTML}</tbody></table>`;
            }).join('');
            return `<h3>${category}</h3>${subCategoriesHTML}`;
        }).join('');

        return `
            <div class="report-view-container">
                <div class="print-header">
                    <div class="logo-container"><img src="assets/logo.png" alt="Lab Logo" class="logo"><h1>A2Z Diagnostic Laboratory</h1></div>
                    <div class="contact-info"><p>123 Medical Lane, Health City, Nepal</p><p>Phone: +977 980-0000000</p></div>
                </div>
                <div class="report-actions top">
                    <button id="btn-back-to-history" class="btn btn-secondary">← Back to Patient History</button>
                    <div>
                        <button id="btn-edit-report" class="btn btn-secondary">✏️ Edit Report</button>
                        <button id="btn-generate-bill" class="btn btn-secondary">💲 Generate Bill</button>
                        <button id="btn-print-report" class="btn btn-primary">🖨️ Print Report</button>
                    </div>
                </div>
                <div class="report-header"><h2>Laboratory Report</h2></div>
                <div class="patient-details-header report-view">
                    <div class="detail-item"><strong>Patient:</strong> ${patientInfo.name}</div>
                    <div class="detail-item"><strong>Age/Sex:</strong> ${Utils.calculateAge(patientInfo.dob)}Y / ${patientInfo.gender}</div>
                    <div class="detail-item"><strong>Patient ID:</strong> ${patientInfo.patientID}</div>
                    <div class="detail-item"><strong>Date:</strong> ${new Date(report.date).toLocaleDateString()}</div>
                    <div class="detail-item detail-full-width"><strong>Address:</strong> ${patientInfo.address}</div>
                    <div class="detail-item detail-full-width"><strong>Referred By:</strong> ${report.referredBy}</div>
                </div>
                <div class="report-body">${resultsHTML}</div>
                <div class="report-footer"><p class="signature-line">Signature</p></div>
            </div>
        `;
    },

    renderBillPage: function(patientInfo, report) {
        let total = 0;
        const billItemsHTML = Object.keys(report.results).map(compositeKey => {
            const [, , testName] = compositeKey.split('|');
            const testDef = DataManager.flatTestMap[testName];
            const price = parseFloat(testDef?.price || 0);
            total += price;
            return `<tr><td>${testName}</td><td class="default-price-cell">${price.toFixed(2)}</td><td><input type="number" class="price-input" value="${price.toFixed(2)}" step="10" min="0"></td></tr>`;
        }).join('');
        return `
            <div class="bill-container report-view-container">
                <div class="print-header">
                    <div class="logo-container"><img src="assets/logo.png" alt="Lab Logo" class="logo"><h1>A2Z Diagnostic Laboratory</h1></div>
                    <div class="contact-info"><p>123 Medical Lane, Health City, Nepal</p><p>Phone: +977 980-0000000</p></div>
                </div>
                 <div class="report-actions top">
                    <button id="btn-back-to-report" class="btn btn-secondary">← Back to Report</button>
                    <div><button id="btn-print-invoice" class="btn btn-primary">🖨️ Print Invoice</button></div>
                </div>
                <div class="report-header"><h2>INVOICE</h2></div>
                <div class="patient-details-header report-view">
                    <div class="detail-item"><strong>Patient:</strong> ${patientInfo.name}</div>
                    <div class="detail-item"><strong>Patient ID:</strong> ${patientInfo.patientID}</div>
                    <div class="detail-item"><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</div>
                    <div class="detail-item"><strong>Report Date:</strong> ${new Date(report.date).toLocaleDateString()}</div>
                </div>
                <div class="report-body">
                    <table class="bill-table results-table">
                        <thead><tr><th>Test Name</th><th class="default-price-cell">Default Price</th><th>Actual Price</th></tr></thead>
                        <tbody>${billItemsHTML}</tbody>
                        <tfoot>
                            <tr>
                                <td class="total-label">Total Amount</td>
                                <td colspan="2" class="total-cell">
                                    <select id="currency-selector"><option value="NPR">NPR</option><option value="USD">USD</option><option value="INR">INR</option></select>
                                    <span id="bill-total" class="total-amount">${total.toFixed(2)}</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                 <div class="report-footer"><p>Thank you!</p></div>
            </div>
        `;
    },

    _createInputField: function(test, existingValue = '') {
        const uniqueKey = `${test.category}|${test.sub_category}|${test.test_name}`;
        const testId = `test-${uniqueKey.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const normalValueHTML = test.normal_values ? `<span class="normal-value">(NV: ${test.normal_values})</span>` : '';
        let inputHTML = '';
        switch (test.input_type) {
            case 'select':
                const optionsHTML = test.options.split(',').map(opt => `<option value="${opt.trim()}" ${opt.trim() === existingValue ? 'selected' : ''}>${opt.trim()}</option>`).join('');
                inputHTML = `<select id="${testId}" name="${uniqueKey}"><option value="">Select</option>${optionsHTML}</select>`;
                break;
            case 'textarea':
                inputHTML = `<textarea id="${testId}" name="${uniqueKey}" rows="2">${existingValue}</textarea>`;
                break;
            default:
                inputHTML = `<input type="text" id="${testId}" name="${uniqueKey}" value="${existingValue}">`;
                break;
        }
        return `<div>${inputHTML}</div>${normalValueHTML}`;
    },
    
    renderReportForm: function(patientInfo, reportMeta, testDefinitions, isEditMode = false) {
        const categories = Object.keys(testDefinitions);
        const sanitizedId = (str) => str.replace(/\s+/g, '-');
        const existingResults = isEditMode ? reportMeta.results : {};
        const tabButtonsHTML = categories.map((cat, index) => `<button type="button" class="tab-btn ${index === 0 ? 'active' : ''}" data-tab-target="#tab-${sanitizedId(cat)}">${cat}</button>`).join('');
        const tabPanesHTML = categories.map((cat, index) => {
            const subCategories = testDefinitions[cat];
            const subCategoriesHTML = Object.keys(subCategories).map(subCatName => {
                const tests = subCategories[subCatName];
                const testsHTML = tests.map(test => {
                    const uniqueKey = `${test.category}|${test.sub_category}|${test.test_name}`;
                    const existingValue = existingResults[uniqueKey] || '';
                    return `<div class="form-group-inline"><label for="test-${sanitizedId(uniqueKey)}">${test.test_name}</label>${this._createInputField(test, existingValue)}</div>`;
                }).join('');
                return `<fieldset class="test-group"><legend>${subCatName}</legend>${testsHTML}</fieldset>`;
            }).join('');
            return `<div class="tab-pane ${index === 0 ? 'active' : ''}" id="tab-${sanitizedId(cat)}">${subCategoriesHTML}</div>`;
        }).join('');
        return `
            <div class="report-form-container">
                <div class="patient-details-header">
                     <div class="detail-item"><strong>Patient:</strong> ${patientInfo.name} (ID: ${patientInfo.patientID})</div>
                     <div class="detail-item"><strong>Age/Sex:</strong> ${Utils.calculateAge(patientInfo.dob)}Y / ${patientInfo.gender}</div>
                     <div class="detail-item"><strong>Referred By:</strong> ${reportMeta.referredBy}</div>
                     <div class="detail-item detail-full-width"><strong>Investigation:</strong> ${reportMeta.investigation}</div>
                </div>
                <form id="report-entry-form">
                    <div class="tab-nav">${tabButtonsHTML}</div>
                    <div class="tab-content">${tabPanesHTML}</div>
                    <div class="form-actions">
                        <button type="button" id="btn-discard-report" class="btn btn-secondary">Discard</button>
                        <button type="submit" class="btn btn-primary">${isEditMode ? 'Update Report' : 'Save Report'}</button>
                    </div>
                </form>
            </div>
        `;
    },
    
    renderErrorPage: function(errorMessage) {
        return `
            <div class="error-container">
                <h2><span class="icon">❌</span> An Error Occurred</h2>
                <p>Something went wrong. Please try again or go back to the home page.</p>
                <div class="error-message-box"><strong>Error Details:</strong><pre>${errorMessage}</pre></div>
                <button id="btn-back-to-home" class="btn btn-secondary">Go Back to Home</button>
            </div>
        `;
    }
};