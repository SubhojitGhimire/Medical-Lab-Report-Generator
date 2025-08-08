document.addEventListener('DOMContentLoaded', () => {

    const appContainer = document.getElementById('app');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;

    const applySavedTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    const navigateTo = async (page, data = null) => {
        appContainer.innerHTML = '<h2><span class="icon">⏳</span> Loading...</h2>';

        try {
            switch(page) {
                case 'home':
                    appContainer.innerHTML = UIManager.renderHomePage();
                    document.getElementById('btn-new-patient').addEventListener('click', () => navigateTo('newPatient'));
                    document.getElementById('btn-existing-patient').addEventListener('click', () => navigateTo('searchPatient'));
                    break;
                case 'newPatient':
                    appContainer.innerHTML = UIManager.renderNewPatientForm();
                    document.getElementById('btn-back-to-home').addEventListener('click', () => navigateTo('home'));
                    document.getElementById('new-patient-form').addEventListener('submit', (e) => {
                        e.preventDefault();
                        handleNewPatientSubmit();
                    });
                    break;
                
                case 'searchPatient':
                    const patients = await DataManager.getAllPatients();
                    appContainer.innerHTML = UIManager.renderPatientSearchPage(patients);
                    document.getElementById('btn-back-to-home').addEventListener('click', () => navigateTo('home'));
    
                    document.getElementById('patient-search-input').addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        document.querySelectorAll('.patient-list-item').forEach(item => {
                            item.style.display = item.textContent.toLowerCase().includes(searchTerm) ? 'flex' : 'none';
                        });
                    });
    
                    document.getElementById('patient-list').addEventListener('click', (e) => {
                        const selectedItem = e.target.closest('.patient-list-item');
                        if(selectedItem) {
                            const filename = selectedItem.dataset.filename;
                            navigateTo('patientRecords', { filename: filename });
                        }
                    });
                    break;

                case 'patientRecords':
                    const records = await DataManager.getPatientRecords(data.filename);
                    if (!records) throw new Error(`Could not load records for ${data.filename}`);
                    appContainer.innerHTML = UIManager.renderPatientRecordsPage(records);
                    document.getElementById('btn-back-to-search').addEventListener('click', () => navigateTo('searchPatient'));
                    document.getElementById('btn-new-record').addEventListener('click', () => handleNewRecordCreation(records[0], data.filename));
                    document.querySelectorAll('.record-actions button').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const recordIndex = e.target.dataset.recordIndex;
                            navigateTo('viewReport', { filename: data.filename, recordIndex: parseInt(recordIndex) });
                        });
                    });
                    break;
                
                case 'newReportForm':
                case 'editReportForm':
                    const isEditMode = page === 'editReportForm';
                    const testDefs = await DataManager.getTestDefinitions();
                    if(!testDefs) throw new Error("Could not load test definitions from tests.csv");
                    
                    const patientInfoForForm = isEditMode ? data.allRecords[0] : data.patientInfo;
                    const reportMeta = isEditMode ? data.allRecords[data.recordIndex] : data.meta;
                    
                    appContainer.innerHTML = UIManager.renderReportForm(patientInfoForForm, reportMeta, testDefs, isEditMode);

                    const tabButtons = document.querySelectorAll('.tab-btn');
                    const tabPanes = document.querySelectorAll('.tab-pane');

                    tabButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            tabButtons.forEach(btn => btn.classList.remove('active'));
                            tabPanes.forEach(pane => pane.classList.remove('active'));

                            button.classList.add('active');
                            const targetPane = document.querySelector(button.dataset.tabTarget);
                            targetPane.classList.add('active');
                        });
                    });
                    
                    document.getElementById('btn-discard-report').addEventListener('click', () => {
                        if(confirm("Are you sure you want to discard this report? All unsaved changes will be lost.")) {
                            navigateTo('patientRecords', { filename: data.filename });
                        }
                    });

                    const reportForm = document.getElementById('report-entry-form');
                    reportForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        if (isEditMode) {
                            handleReportUpdate(reportForm, data);
                        } else {
                            handleReportSubmit(reportForm, data.filename, data.meta);
                        }
                    });
                    break;
                
                case 'viewReport':
                    await DataManager.getTestDefinitions(); 
                    const allRecords = await DataManager.getPatientRecords(data.filename);
                    if (!allRecords) throw new Error(`Could not load records for ${data.filename}`);
                    const patientInfoForView = allRecords[0];
                    const reportToView = allRecords[data.recordIndex];
                    appContainer.innerHTML = UIManager.renderReportView(patientInfoForView, reportToView);
                    document.getElementById('btn-back-to-history').addEventListener('click', () => navigateTo('patientRecords', { filename: data.filename }));
                    document.getElementById('btn-print-report').addEventListener('click', () => window.print());
                    document.getElementById('btn-edit-report').addEventListener('click', () => navigateTo('editReportForm', { filename: data.filename, allRecords: allRecords, recordIndex: data.recordIndex }));
                    document.getElementById('btn-generate-bill').addEventListener('click', () => {
                        navigateTo('generateBill', { filename: data.filename, recordIndex: data.recordIndex });
                    });
                    break;
                
                case 'generateBill':
                    await DataManager.getTestDefinitions();
                    const recordsForBill = await DataManager.getPatientRecords(data.filename);
                    const patientInfoForBill = recordsForBill[0];
                    const reportForBill = recordsForBill[data.recordIndex];
                
                    appContainer.innerHTML = UIManager.renderBillPage(patientInfoForBill, reportForBill);
                
                    updateBillTotal();
                
                    appContainer.addEventListener('input', (e) => {
                        if (e.target.classList.contains('price-input')) {
                            updateBillTotal();
                        }
                    });
                
                    document.getElementById('btn-back-to-report').addEventListener('click', () => navigateTo('viewReport', { filename: data.filename, recordIndex: data.recordIndex }));
                    document.getElementById('btn-print-invoice').addEventListener('click', () => window.print());
                    break;

                default:
                    throw new Error(`Page "${page}" not found.`);
            }
        } catch (error) {
            console.error(`Navigation to "${page}" failed:`, error);
            appContainer.innerHTML = `...`; // your existing robust error html
            const backButton = document.getElementById('error-back-to-home');
            if (backButton) {
                backButton.addEventListener('click', () => navigateTo('home'));
            }
        }
    };

    const handleReportUpdate = async (form, data) => {
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="icon">⏳</span> Updating Report...';
        const formData = new FormData(form);
        const reportResults = {};
        for (const [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                reportResults[key] = value.trim();
            }
        }
        
        const originalReport = data.allRecords[data.recordIndex];
        const updatedReport = { ...originalReport, results: reportResults };
        const updatedAllRecords = [...data.allRecords];
        updatedAllRecords[data.recordIndex] = updatedReport;

        const success = await DataManager.updateReport(data.filename, updatedAllRecords);
        if (success) {
            alert("Report updated successfully!");
            navigateTo('viewReport', { filename: data.filename, recordIndex: data.recordIndex });
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="icon">💾</span> Update Report';
        }
    };

    const handleNewRecordCreation = (patientInfo, filename) => {
        const modalHTML = UIManager.renderNewRecordModal();
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalBackdrop = document.getElementById('modal-backdrop');
        const modalForm = document.getElementById('new-record-meta-form');
        const cancelBtn = document.getElementById('btn-modal-cancel');

        const closeModal = () => modalBackdrop.remove();

        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeModal();
        });
        cancelBtn.addEventListener('click', closeModal);
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const recordMeta = {
                referredBy: document.getElementById('referred-by').value,
                investigation: document.getElementById('investigation-requested').value
            };
            closeModal();
            navigateTo('newReportForm', { patientInfo, meta: recordMeta, filename });
        });
    };

    const handleReportSubmit = async (form, filename, reportMeta) => {
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="icon">⏳</span> Saving Report...';

        const formData = new FormData(form);
        const reportResults = {};

        for (const [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                reportResults[key] = value.trim();
            }
        }

        const reportRecord = {
            type: 'lab_report',
            date: new Date().toISOString(),
            ...reportMeta,
            results: reportResults
        };

        const success = await DataManager.appendRecord(filename, reportRecord);

        if (success) {
            alert("Report saved successfully!");
            navigateTo('patientRecords', { filename: filename });
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="icon">💾</span> Save Report';
        }
    };

    const handleNewPatientSubmit = async () => {
        const submitButton = document.querySelector('#new-patient-form button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="icon">⏳</span> Saving...';

        const patientData = {
            name: document.getElementById('patient-name').value,
            dob: document.getElementById('patient-dob').value,
            gender: document.getElementById('patient-gender').value,
            address: document.getElementById('patient-address').value,
            phone: document.getElementById('patient-phone').value,
        };
        
        const success = await DataManager.saveNewPatient(patientData);

        if (success) {
            alert("Patient saved successfully!");
            navigateTo('home');
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span class="icon">💾</span> Save Patient';
        }
    };

    const updateBillTotal = () => {
        const priceInputs = document.querySelectorAll('.price-input');
        let total = 0;
        priceInputs.forEach(input => {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                total += value;
            }
        });
        document.getElementById('bill-total').textContent = total.toFixed(2);
    };

    const initialize = () => {
        applySavedTheme();
        navigateTo('home');
    };

    initialize();
});