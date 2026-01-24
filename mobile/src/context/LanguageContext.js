import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
    en: {
        greeting: "Hello,",
        welcome: "Welcome,",
        todayStatus: "Today's Status",
        checkedIn: "Checked In",
        checkedOut: "Checked Out",
        notCheckedIn: "Not Checked In",
        checkInNow: "Check In Now",
        pendingTasks: "Pending Tasks",
        issues: "Issues",
        messages: "Messages",
        dailyWork: "Daily Work",
        attendanceManagement: 'Attendance Management',
        taskManagement: 'Task Management',
        materialRequests: 'Material Requests',
        dailyProgressReport: 'Daily Progress Report',
        teamCommunication: 'Team Communication',
        logout: "Logout",
        siteEngineer: "Site Engineer",
        worker: "Worker",
        selectLanguage: "Select Language",
        cancel: "Cancel",
        // Navigation
        nav_dashboard: "Home",
        nav_team: "Team",
        nav_tasks: "Tasks",
        nav_attendance: "Attendance",
        nav_issues: "Issues",
        nav_profile: "Profile",
        // Issues Screen
        reportedIssues: "Reported Issues",
        noOutstandingIssues: "No Outstanding Issues",
        submittedBy: "Submitted By",
        resolve: "Resolve",
        // Attendance Screen
        attendance: "Attendance",
        currentStatus: "Current Status",
        retryLocation: "Retry Location",
        fetching: "Fetching...",
        takeSelfie: "Take Selfie",
        retake: "Retake",
        checkIn: "Check In",
        checkOut: "Check Out",
        checkInSuccess: "Check In Successful",
        checkOutSuccess: "Check Out Successful",
        // Task Screen
        myTasks: "My Tasks",
        startTask: "Start Task",
        markDone: "Mark Done",
        close: "Close",
        priority: "Priority",
        due: "Due",
        // Numbers
        num_1: "1", num_2: "2", num_3: "3", num_4: "4", num_5: "5",
        num_6: "6", num_7: "7", num_8: "8", num_9: "9", num_10: "10",
        num_11: "11", num_12: "12", num_13: "13", num_14: "14", num_15: "15",
        num_16: "16", num_17: "17", num_18: "18", num_19: "19", num_20: "20",
    },
    hi: {
        greeting: "नमस्ते,",
        welcome: "स्वागत है,",
        todayStatus: "आज की स्थिति",
        checkedIn: "चेक इन किया",
        checkedOut: "चेक आउट किया",
        notCheckedIn: "चेक इन नहीं किया",
        checkInNow: "अभी चेक इन करें",
        pendingTasks: "लंबित कार्य",
        issues: "समस्याएं",
        messages: "संदेश",
        dailyWork: "दैनिक कार्य",
        attendanceManagement: 'उपस्थिति प्रबंधन',
        taskManagement: 'कार्य प्रबंधन',
        materialRequests: 'सामग्री अनुरोध',
        dailyProgressReport: 'दैनिक प्रगति रिपोर्ट',
        teamCommunication: 'टीम संचार',
        logout: "लॉग आउट",
        siteEngineer: "साइट इंजीनियर",
        worker: "कर्मचारी",
        selectLanguage: "भाषा चुनें",
        cancel: "रद्द करें",
        // Navigation
        nav_dashboard: "होम",
        nav_team: "टीम",
        nav_tasks: "कार्य",
        nav_attendance: "उपस्थिति",
        nav_issues: "समस्याएं",
        nav_profile: "प्रोफाइल",
        // Issues Screen
        reportedIssues: "रिपोर्ट की गई समस्याएं",
        noOutstandingIssues: "कोई शेष समस्या नहीं",
        submittedBy: "द्वारा प्रस्तुत",
        resolve: "हल करें",
        // Attendance Screen
        attendance: "उपस्थिति",
        currentStatus: "वर्तमान स्थिति",
        retryLocation: "लोकेशन पुनः प्रयास करें",
        fetching: "प्राप्त कर रहा है...",
        takeSelfie: "सेल्फी लें",
        retake: "पुनः लें",
        checkIn: "चेक इन",
        checkOut: "चेक आउट",
        checkInSuccess: "चेक इन सफल",
        checkOutSuccess: "चेक आउट सफल",
        // Task Screen
        myTasks: "मेरे कार्य",
        startTask: "कार्य शुरू करें",
        markDone: "पूरा करें",
        close: "बंद करें",
        priority: "प्राथमिकता",
        due: "देय",
        // Numbers
        num_1: "१", num_2: "२", num_3: "३", num_4: "४", num_5: "५",
        num_6: "६", num_7: "७", num_8: "८", num_9: "९", num_10: "१०",
        num_11: "११", num_12: "१२", num_13: "१३", num_14: "१४", num_15: "१५",
        num_16: "१६", num_17: "१७", num_18: "१८", num_19: "१९", num_20: "२०",
    },
    kn: {
        greeting: "नमस्कार,",
        welcome: "ಸ್ವಾಗತ,",
        todayStatus: "ಇಂದಿನ ಸ್ಥಿತಿ",
        checkedIn: "ಚೆಕ್ ಇನ್ ಆಗಿದೆ",
        checkedOut: "ಚೆಕ್ ಔಟ್ ಆಗಿದೆ",
        notCheckedIn: "ಚೆಕ್ ಇನ್ ಆಗಿಲ್ಲ",
        checkInNow: "ಈಗ ಚೆಕ್ ಇನ್ ಮಾಡಿ",
        pendingTasks: "ಬಾಕಿ ಉಳಿದಿರುವ ಕಾರ್ಯಗಳು",
        issues: "ಸಮಸ್ಯೆಗಳು",
        messages: "ಸಂದೇಶಗಳು",
        dailyWork: "ದೈನಂದಿನ ಕೆಲಸ",
        attendanceManagement: 'ಹಾಜರಾತಿ ನಿರ್ವಹಣೆ',
        taskManagement: 'ಕಾರ್ಯ ನಿರ್ವಹಣೆ',
        materialRequests: 'ವಸ್ತುಗಳ ವಿನಂತಿ',
        dailyProgressReport: 'ದೈನಂದಿನ ಪ್ರಗತಿ ವರದಿ',
        teamCommunication: 'ತಂಡದ ಸಂಪರ್ಕ',
        logout: "ಲಾಗ್ ಔಟ್",
        siteEngineer: "ಸೈಟ್ ಇಂಜಿನಿಯರ್",
        worker: "ಕೆಲಸಗಾರ",
        selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
        cancel: "ರದ್ದುಮಾಡಿ",
        // Navigation
        nav_dashboard: "ಮುಖಪುಟ",
        nav_team: "ತಂಡ",
        nav_tasks: "ಕಾರ್ಯಗಳು",
        nav_attendance: "ಹಾಜರಾತಿ",
        nav_issues: "ಸಮಸ್ಯೆಗಳು",
        nav_profile: "ಪ್ರೊಫೈಲ್",
        // Issues Screen
        reportedIssues: "ವರದಿಯಾದ ಸಮಸ್ಯೆಗಳು",
        noOutstandingIssues: "ಬಾಕಿ ಇರುವ ಸಮಸ್ಯೆಗಳಿಲ್ಲ",
        submittedBy: "ಸಲ್ಲಿಸಿದವರು",
        resolve: "ಪರಿಹರಿಸಿ",
        // Attendance Screen
        attendance: "ಹಾಜರಾತಿ",
        currentStatus: "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
        retryLocation: "ಸ್ಥಳವನ್ನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
        fetching: "ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
        takeSelfie: "ಸೆಲ್ಫಿ ತೆಗೆದುಕೊಳ್ಳಿ",
        retake: "ಮತ್ತೆ ತೆಗೆದುಕೊಳ್ಳಿ",
        checkIn: "ಚೆಕ್ ಇನ್",
        checkOut: "ಚೆಕ್ ಔಟ್",
        checkInSuccess: "ಚೆಕ್ ಇನ್ ಯಶಸ್ವಿಯಾಗಿದೆ",
        checkOutSuccess: "ಚೆಕ್ ಔಟ್ ಯಶಸ್ವಿಯಾಗಿದೆ",
        // Task Screen
        myTasks: "ನನ್ನ ಕಾರ್ಯಗಳು",
        startTask: "ಕಾರ್ಯ ಪ್ರಾರಂಭಿಸಿ",
        markDone: "ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ",
        close: "ಮುಚ್ಚಿ",
        priority: "ಆದ್ಯತೆ",
        due: "ಗಡುವು",
    },
    mr: {
        greeting: "नमस्कार,",
        welcome: "स्वागत आहे,",
        todayStatus: "आजची स्थिती",
        checkedIn: "चेक इन केले",
        checkedOut: "चेक आउट केले",
        notCheckedIn: "चेक इन केले नाही",
        checkInNow: "आत्ता चेक इन करा",
        pendingTasks: "प्रलंबित कार्ये",
        issues: "समस्या",
        messages: "संदेश",
        dailyWork: "दैनंदिन काम",
        attendanceManagement: 'उपस्थिती व्यवस्थापन',
        taskManagement: 'कार्य व्यवस्थापन',
        materialRequests: 'साहित्य विनंती',
        dailyProgressReport: 'दैनंदिन प्रगती अहवाल',
        teamCommunication: 'टीम संवाद',
        logout: "लॉग आउट",
        siteEngineer: "साइट अभियंता",
        worker: "कामगार",
        selectLanguage: "भाषा निवडा",
        cancel: "रद्द करा",
        // Navigation
        nav_dashboard: "होम",
        nav_team: "टीम",
        nav_tasks: "कार्ये",
        nav_attendance: "उपस्थिती",
        nav_issues: "समस्या",
        nav_profile: "प्रोफाइल",
        // Issues Screen
        reportedIssues: "नोंदवलेल्या समस्या",
        noOutstandingIssues: "कोणतीही प्रलंबित समस्या नाही",
        submittedBy: "द्वारे सादर",
        resolve: "सोडवा",
        // Attendance Screen
        attendance: "उपस्थिती",
        currentStatus: "सद्यस्थिती",
        retryLocation: "लोकेशन पुन्हा प्रयत्न करा",
        fetching: "मिळवत आहे...",
        takeSelfie: "सेल्फी घ्या",
        retake: "पुन्हा घ्या",
        checkIn: "चेक इन",
        checkOut: "चेक आउट",
        checkInSuccess: "चेक इन यशस्वी",
        checkOutSuccess: "चेक आउट यशस्वी",
        // Task Screen
        myTasks: "माझी कार्ये",
        startTask: "कार्य सुरू करा",
        markDone: "पूर्ण झाले",
        close: "बंद करा",
        priority: "प्राधान्य",
        due: "देय",
    },
    bn: {
        greeting: "হ্যালো,",
        welcome: "স্বাগতম,",
        todayStatus: "আজকের স্থিতি",
        checkedIn: "চেক ইন করেছেন",
        checkedOut: "চেক আউট করেছেন",
        notCheckedIn: "চেক ইন করেননি",
        checkInNow: "এখন চেক ইন করুন",
        pendingTasks: "অমীমাংসিত কাজ",
        issues: "সমস্যা",
        messages: "বার্তা",
        dailyWork: "দৈনিক কাজ",
        attendanceManagement: 'উপস্থিতি ব্যবস্থাপনা',
        taskManagement: 'কাজ ব্যবস্থাপনা',
        materialRequests: 'উপাদান অনুরোধ',
        dailyProgressReport: 'দৈনিক অগ্রগতি প্রতিবেদন',
        teamCommunication: 'দল যোগাযোগ',
        logout: "লগ আউট",
        siteEngineer: "সাইট ইঞ্জিনিয়ার",
        worker: "কর্মী",
        selectLanguage: "ভাষা নির্বাচন করুন",
        cancel: "বাতিল করুন",
        // Navigation
        nav_dashboard: "হোম",
        nav_team: "টিম",
        nav_tasks: "কাজ",
        nav_attendance: "উপস্থিতি",
        nav_issues: "সমস্যা",
        nav_profile: "প্রোফাইল",
        // Issues Screen
        reportedIssues: "রিপোর্ট করা সমস্যা",
        noOutstandingIssues: "কোনো সমস্যা বাকি নেই",
        submittedBy: "জমা দিয়েছেন",
        resolve: "সমাধান করুন",
        // Attendance Screen
        attendance: "উপস্থিতি",
        currentStatus: "বর্তমান অবস্থা",
        retryLocation: "অবস্থান পুনরায় চেষ্টা করুন",
        fetching: "আনা হচ্ছে...",
        takeSelfie: "সেলফি তুলুন",
        retake: "আবার নিন",
        checkIn: "চেক ইন",
        checkOut: "চেক আউট",
        checkInSuccess: "চেক ইন সফল হয়েছে",
        checkOutSuccess: "চেক আউট সফল হয়েছে",
        // Task Screen
        myTasks: "আমার কাজ",
        startTask: "কাজ শুরু করুন",
        markDone: "সম্পন্ন",
        close: "বন্ধ করুন",
        priority: "অগ্রাধিকার",
        due: "বাকি",
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const storedLang = await AsyncStorage.getItem('appLanguage');
            if (storedLang) {
                setLanguage(storedLang);
            }
        } catch (error) {
            console.error('Failed to load language', error);
        }
    };

    const switchLanguage = async (lang) => {
        try {
            await AsyncStorage.setItem('appLanguage', lang);
            setLanguage(lang);
        } catch (error) {
            console.error('Failed to save language', error);
        }
    };

    const convertNumber = (num) => {
        if (num === undefined || num === null) return '';
        const str = num.toString();
        
        if (language === 'hi' || language === 'mr') { // Marathi uses same numerals as Hindi
            const hindiDigits = {
                '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
                '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
            };
            return str.replace(/[0-9]/g, (d) => hindiDigits[d]);
        } else if (language === 'kn') {
            const kannadaDigits = {
                '0': '೦', '1': '೧', '2': '೨', '3': '೩', '4': '೪',
                '5': '೫', '6': '೬', '7': '೭', '8': '೮', '9': '೯'
            };
            return str.replace(/[0-9]/g, (d) => kannadaDigits[d]);
        } else if (language === 'bn') {
            const bengaliDigits = {
                '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
                '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
            };
            return str.replace(/[0-9]/g, (d) => bengaliDigits[d]);
        }
        
        return str;
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t, convertNumber }}>
            {children}
        </LanguageContext.Provider>
    );
};
