import '@testing-library/jest-dom';

// Silencia rechazos no manejados de mocks de axios
window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
});