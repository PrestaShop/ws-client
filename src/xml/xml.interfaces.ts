export type LanguageValue = {
  language: {
    '@id': string;
    '#': string;
  };
};

export const getLanguageValue = (translation: Translation): LanguageValue => {
  return {
    language: {
      '@id': String(translation.id),
      '#': translation.value,
    },
  };
};

type Translation = {
  id: number;
  value: string;
};

export const getLanguageValues = (
  ...translations: Translation[]
): LanguageValue[] => {
  const result: LanguageValue[] = [];
  translations.forEach((translation) => {
    result.push(getLanguageValue(translation));
  });

  return result;
};
