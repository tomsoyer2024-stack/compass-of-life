export const backgrounds = {
    glass: {
        id: 'glass',
        name: 'Glass',
        bg: '#f5f5f7',
        color: '#1d1d1f'
    },
    dawn: {
        id: 'dawn',
        name: 'Dawn',
        bg: 'linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)',
        color: '#ffffff'
    },
    aurora: {
        id: 'aurora',
        name: 'Aurora',
        bg: 'linear-gradient(135deg, #5856D6 0%, #007AFF 100%)',
        color: '#ffffff'
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight',
        bg: '#000000',
        color: '#ffffff'
    }
};

export const applyTheme = (bgId) => {
    const theme = backgrounds[bgId] || backgrounds.glass;
    document.documentElement.style.setProperty('--bg-color', theme.bg);
    document.documentElement.style.setProperty('--text-color', theme.color);
    return theme;
};
