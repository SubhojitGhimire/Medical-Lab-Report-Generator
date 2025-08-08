const Utils = {
    generatePatientID: function() {
        return `P${Date.now()}`;
    },
    
    sanitizeNameForFilename: function(name) {
        return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    },
    
    calculateAge: function(dobString) {
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    },
};