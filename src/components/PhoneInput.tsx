import React, { useState } from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

const countryCodes = [
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+240', flag: '🇬🇶', name: 'Guinea Ecuatorial' },
    { code: '+237', flag: '🇨🇲', name: 'Camerún' },
    { code: '+33', flag: '🇫🇷', name: 'Francia' },
    { code: '+1', flag: '🇺🇸', name: 'USA/Canadá' },
    { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
    { code: '+49', flag: '🇩🇪', name: 'Alemania' },
    { code: '+39', flag: '🇮🇹', name: 'Italia' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChange,
    placeholder = 'Número de teléfono',
    required = false,
    className = ''
}) => {
    // Extract country code and number from value
    const getInitialCountryCode = () => {
        for (const country of countryCodes) {
            if (value.startsWith(country.code)) {
                return country.code;
            }
        }
        return '+34'; // Default to Spain
    };

    const getPhoneNumber = () => {
        const countryCode = getInitialCountryCode();
        return value.replace(countryCode, '').trim();
    };

    const [selectedCode, setSelectedCode] = useState(getInitialCountryCode());
    const [phoneNumber, setPhoneNumber] = useState(getPhoneNumber());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleCountryChange = (code: string) => {
        setSelectedCode(code);
        setIsDropdownOpen(false);
        onChange(`${code} ${phoneNumber}`);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = e.target.value;
        setPhoneNumber(num);
        onChange(`${selectedCode} ${num}`);
    };

    const selectedCountry = countryCodes.find(c => c.code === selectedCode) || countryCodes[0];

    return (
        <div className={`flex gap-2 ${className}`}>
            {/* Country Code Selector */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-100 transition-colors min-w-[100px]"
                >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-sm font-bold text-gray-700">{selectedCountry.code}</span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsDropdownOpen(false)}
                        />

                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                            {countryCodes.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountryChange(country.code)}
                                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-teal-50 transition-colors text-left ${selectedCode === country.code ? 'bg-teal-50' : ''
                                        }`}
                                >
                                    <span className="text-2xl">{country.flag}</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-800">{country.name}</div>
                                        <div className="text-xs text-gray-500">{country.code}</div>
                                    </div>
                                    {selectedCode === country.code && (
                                        <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Phone Number Input */}
            <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={placeholder}
                required={required}
                // Use text-[16px] to prevent mobile browsers from auto-zooming
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[16px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
        </div>
    );
};
