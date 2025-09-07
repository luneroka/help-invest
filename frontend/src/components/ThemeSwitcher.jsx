import { useState, useEffect } from 'react';
import themes from '../../assets/themes';

function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'default';
  });

  const applyTheme = (themeKey) => {
    const themeProperties = themes[themeKey];
    if (!themeProperties) {
      console.warn(`Theme "${themeKey}" not found. Falling back to default.`);
      return;
    }
    Object.entries(themeProperties).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div>
      <select
        id='theme-select'
        value={theme}
        onChange={handleThemeChange}
        className='focus:outline-none w-full cursor-pointer'
      >
        <option value='default'>Classic</option>
        <option value='dark'>Dark</option>
        <option value='ocean'>Océan</option>
        <option value='pastel'>Pastel</option>
      </select>
    </div>
  );
}

export default ThemeSwitcher;
