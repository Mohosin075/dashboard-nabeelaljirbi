export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const SUPPORTED_COUNTRIES: Country[] = [
  {
    code: 'LY',
    name: 'Libya',
    dialCode: '+218',
    flag: '🇱🇾',
  },
  {
    code: 'TN',
    name: 'Tunisia',
    dialCode: '+216',
    flag: '🇹🇳',
  },
  {
    code: 'EG',
    name: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
  },
  {
    code: 'DZ',
    name: 'Algeria',
    dialCode: '+213',
    flag: '🇩🇿',
  },
  {
    code: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    flag: '🇧🇩',
  },
];

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return SUPPORTED_COUNTRIES.find((c) => c.dialCode === dialCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return SUPPORTED_COUNTRIES.find((c) => c.code === code);
};
