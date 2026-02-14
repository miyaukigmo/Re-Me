export const THEME_COLORS = [
    { name: 'Indigo', main: '#4f46e5', bg: '#eef2ff' }, // Indigo-600, Indigo-50
    { name: 'Teal', main: '#0d9488', bg: '#f0fdfa' },   // Teal-600, Teal-50
    { name: 'Slate', main: '#475569', bg: '#f8fafc' },  // Slate-600, Slate-50
    { name: 'Rose', main: '#e11d48', bg: '#fff1f2' },   // Rose-600, Rose-50 (Low saturation/muted usage)
    { name: 'Amber', main: '#d97706', bg: '#fffbeb' },  // Amber-600, Amber-50
];

export type Theme = typeof THEME_COLORS[number];

export function getRandomTheme(): Theme {
    // Simple random selection
    // In the future, this could be based on time of day or other factors
    const index = Math.floor(Math.random() * THEME_COLORS.length);
    return THEME_COLORS[index];
}
