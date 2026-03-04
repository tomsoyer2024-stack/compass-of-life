// Arch Item 24: Unit Test Setup
import '@testing-library/jest-dom';

// Polyfills or global mocks can go here
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
