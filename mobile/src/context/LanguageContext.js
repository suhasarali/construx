import { createContext, useState, useContext } from 'react';

const translations = {
    en: {
        welcome: 'Welcome',
        login: 'Login',
        attendance: 'Attendance',
        checkIn: 'Check In',
        checkOut: 'Check Out',
        dailyLog: 'Daily Work Log',
        submit: 'Submit',
        tasks: 'Tasks',
        materials: 'Materials',
        requestMaterial: 'Request Material',
        approve: 'Approve',
        reject: 'Reject',
        pending: 'Pending',
        description: 'Description',
        photo: 'Take Photo',
        logout: 'Logout',
    },
    hi: {
        welcome: 'स्वागत है',
        login: 'लॉग इन करें',
        attendance: 'उपस्थिति',
        checkIn: 'चेक इन',
        checkOut: 'चेक आउट',
        dailyLog: 'दैनिक कार्य रिपोर्ट',
        submit: 'जमा करें',
        tasks: 'कार्य',
        materials: 'सामग्री',
        requestMaterial: 'सामग्री अनुरोध',
        approve: 'मंजूर करें',
        reject: 'अस्वीकार करें',
        pending: 'लंभित',
        description: 'विवरण',
        photo: 'फोटो लें',
        logout: 'लॉग आउट',
    },
    // Add Marathi and Tamil as placeholders/implementation
    mr: {
        welcome: 'स्वागत आहे',
        login: 'लॉग इन करा',
        attendance: 'उपस्थिती',
        checkIn: 'चेक इन',
        checkOut: 'चेक आउट',
        dailyLog: 'दैनिक कार्य अहवाल',
        submit: 'सादर करा',
        tasks: 'कार्य',
        materials: 'साहित्य',
        requestMaterial: 'साहित्य विनंती',
        approve: 'मंजूर',
        reject: 'नाकारले',
        pending: 'प्रलंबित',
        description: 'वर्णन',
        photo: 'फोटो घ्या',
        logout: 'लॉग आउट',
    },
    ta: {
        welcome: 'வரவேற்பு',
        login: 'உள்நுழைய',
        attendance: 'வருகை',
        checkIn: 'செக் இன்',
        checkOut: 'வெளியேறு',
        dailyLog: 'தினசரி வேலை பதிவு',
        submit: 'சமர்ப்பிக்கவும்',
        tasks: 'பணிகள்',
        materials: 'பொருட்கள்',
        requestMaterial: 'பொருள் கோரிக்கை',
        approve: 'ஒப்புதல்',
        reject: 'நிராகரி',
        pending: 'நிலுவையில் உள்ளது',
        description: 'விளக்கம்',
        photo: 'புகைப்படம் எடு',
        logout: 'வெளியேறு',
    }
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
