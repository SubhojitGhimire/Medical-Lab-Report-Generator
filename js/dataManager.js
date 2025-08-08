const DataManager = {
    dataDirectoryHandle: null,
    testDefinitions: null,
    flatTestMap: null,

    getDirectoryHandle: async function() {
        if (this.dataDirectoryHandle) return this.dataDirectoryHandle;
        try {
            const handle = await window.showDirectoryPicker();
            this.dataDirectoryHandle = handle;
            return handle;
        } catch (error) {
            console.error("User cancelled directory picker or an error occurred:", error);
            return null;
        }
    },

    getTestDefinitions: async function() {
        if (this.testDefinitions) return this.testDefinitions;
        try {
            const response = await fetch('./tests.csv');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();
            
            const lines = csvText.trim().split('\n');
            const header = lines.shift().split(',').map(h => h.trim());
            
            const parseCsvLine = (line) => {
                const values = [];
                let currentPos = 0;
                while (currentPos < line.length) {
                    let endPos;
                    if (line.charAt(currentPos) === '"') {
                        currentPos++;
                        endPos = currentPos;
                        while (endPos < line.length) {
                            if (line.charAt(endPos) === '"' && line.charAt(endPos + 1) === '"') {
                                endPos += 2;
                            } else if (line.charAt(endPos) === '"') {
                                break;
                            } else {
                                endPos++;
                            }
                        }
                        values.push(line.substring(currentPos, endPos).replace(/""/g, '"'));
                        currentPos = endPos + 2;
                    } else {
                        endPos = line.indexOf(',', currentPos);
                        if (endPos === -1) endPos = line.length;
                        values.push(line.substring(currentPos, endPos));
                        currentPos = endPos + 1;
                    }
                }
                return values;
            };

            const tests = lines.map(line => {
                const values = parseCsvLine(line);
                let entry = {};
                header.forEach((col, index) => {
                    entry[col] = (values[index] || '').trim();
                });
                return entry;
            });

            const structuredTests = {};
            this.flatTestMap = {};
            tests.forEach(test => {
                const { category, sub_category, test_name } = test;
                if (!category || !test_name) return;
                if (!structuredTests[category]) structuredTests[category] = {};
                const subCatKey = sub_category || 'General';
                if (!structuredTests[category][subCatKey]) structuredTests[category][subCatKey] = [];
                
                structuredTests[category][subCatKey].push(test);
                this.flatTestMap[test_name] = test;
            });

            this.testDefinitions = structuredTests;
            console.log("Test Definitions Loaded:", this.testDefinitions);
            return this.testDefinitions;

        } catch (error) {
            console.error("Failed to load or parse tests.csv:", error);
            return null;
        }
    },

    getAllPatients: async function() {
        const dirHandle = await this.getDirectoryHandle();
        if (!dirHandle) {
            alert("Permission to the 'data' directory is required to find patients.");
            return [];
        }
        const patients = [];
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.jsonl')) {
                const parts = entry.name.replace('.jsonl', '').split('_');
                const patientId = parts[0];
                const patientName = (parts[1] || 'Unknown').replace(/-/g, ' ');
                patients.push({ id: patientId, name: patientName, filename: entry.name });
            }
        }
        return patients;
    },

    getPatientRecords: async function(filename) {
        const dirHandle = await this.getDirectoryHandle();
        if (!dirHandle) return null;

        try {
            const fileHandle = await dirHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            const contents = await file.text();
            
            const records = contents.trim().split('\n').filter(line => line.trim() !== '').map(line => JSON.parse(line));
            return records;
        } catch (error) {
            console.error(`Error reading patient file ${filename}:`, error);
            return null;
        }
    },

    appendRecord: async function(filename, recordData) {
        const dirHandle = await this.getDirectoryHandle();
        if (!dirHandle) return false;

        try {
            const fileHandle = await dirHandle.getFileHandle(filename, { create: false });
            const writable = await fileHandle.createWritable({ keepExistingData: true });
            const file = await fileHandle.getFile();
            await writable.seek(file.size);
            const contentToWrite = (file.size > 0 ? '\n' : '') + JSON.stringify(recordData);
            await writable.write(contentToWrite);
            await writable.close();
            console.log(`Successfully appended record to ${filename}`);
            return true;
        } catch (error) {
            console.error("Error appending record:", error);
            alert(`Could not save the report. Error: ${error.message}`);
            return false;
        }
    },

    updateReport: async function(filename, allRecords) {
        const dirHandle = await this.getDirectoryHandle();
        if (!dirHandle) return false;

        try {
            const fileHandle = await dirHandle.getFileHandle(filename, { create: false });
            const writable = await fileHandle.createWritable({ keepExistingData: false });

            const fileContent = allRecords
                .map(record => JSON.stringify(record))
                .join('\n');
            
            await writable.write(fileContent);
            await writable.close();
            
            console.log(`Successfully updated report in ${filename}`);
            return true;
        } catch (error) {
            console.error("Error updating report:", error);
            alert(`Could not update the report. Error: ${error.message}`);
            return false;
        }
    },

    saveNewPatient: async function(patientData) {
        const dirHandle = await this.getDirectoryHandle();
        if (!dirHandle) {
            alert("You must select the 'data' directory to save patients.");
            return false;
        }
        const patientID = Utils.generatePatientID();
        patientData.patientID = patientID;
        const sanitizedName = Utils.sanitizeNameForFilename(patientData.name);
        const filename = `${patientID}_${sanitizedName}.jsonl`;
        try {
            const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            const fileContent = JSON.stringify(patientData) + '\n';
            await writable.write(fileContent);
            await writable.close();
            console.log(`Successfully saved patient to ${filename}`);
            return true;
        } catch (error) {
            console.error("Error saving file:", error);
            alert(`Could not save the file. Error: ${error.message}`);
            return false;
        }
    }
};