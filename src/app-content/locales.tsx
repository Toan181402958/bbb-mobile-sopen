import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import '../utils/locales/i18n';
import logger from '../services/logger';

interface LocalesControllerProps {
  defaultLanguage?: string; // cho phép optional, default 'en'
}

const LocalesController: React.FC<LocalesControllerProps> = ({
  defaultLanguage = 'en',
}) => {
  const {i18n} = useTranslation();

  useEffect(() => {
    const changeLanguage = async (lng: string) => {
      try {
        await i18n.changeLanguage(lng);
        logger.debug(
          {logCode: 'app_locale_change'},
          'Change locale successfully',
        );
      } catch (err) {
        logger.debug(
          {
            logCode: 'app_locale_change',
            extraInfo: err,
          },
          'Change locale error',
        );
      }
    };

    changeLanguage(defaultLanguage);
  }, [defaultLanguage, i18n]);

  return null;
};

export default LocalesController;
