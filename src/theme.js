import { theme } from "@chakra-ui/core";

// Let's say you want to add custom colors
const customTheme = {
    ...theme,
    fonts: {
        heading: '"Comic Sans MS", "Avenir Next", sans-serif',
        body: '"Comic Sans MS", system-ui, sans-serif',
        mono: "Menlo, monospace",
    },
    colors: {
        ...theme.colors,
        brand: {
            900: "#1a365d",
            800: "#153e75",
            700: "#2a69ac",
        },
    },
};

export default customTheme