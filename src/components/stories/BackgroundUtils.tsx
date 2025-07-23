// Utility functions for handling story backgrounds

export const BACKGROUND_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
];

export const SOLID_COLORS = [
  "#667eea",
  "#f093fb", 
  "#4facfe",
  "#43e97b",
  "#fa709a",
  "#a8edea",
  "#ff9a9e",
  "#ffecd2",
];

/**
 * Extract the primary color from a gradient for fallback purposes
 */
export const extractPrimaryColor = (background: string): string => {
  if (background.startsWith("linear-gradient")) {
    // Extract the first color from the gradient
    const match = background.match(/#[a-fA-F0-9]{6}/);
    return match ? match[0] : "#667eea";
  }
  return background;
};

/**
 * Validate if a background string is safe to store
 */
export const isValidBackground = (background: string): boolean => {
  // Check length (database limit)
  if (background.length > 255) {
    return false;
  }
  
  // Check if it's a valid hex color
  if (/^#[a-fA-F0-9]{6}$/.test(background)) {
    return true;
  }
  
  // Check if it's a valid CSS gradient
  if (background.startsWith("linear-gradient") || background.startsWith("radial-gradient")) {
    return true;
  }
  
  return false;
};

/**
 * Get a safe background that fits database constraints
 */
export const getSafeBackground = (background: string): string => {
  if (isValidBackground(background)) {
    return background;
  }
  
  // If the gradient is too long, extract the primary color
  if (background.startsWith("linear-gradient")) {
    const primaryColor = extractPrimaryColor(background);
    console.warn(`Background too long, using primary color: ${primaryColor}`);
    return primaryColor;
  }
  
  // Default fallback
  return "#667eea";
};

/**
 * Create CSS style object from background string
 */
export const getBackgroundStyle = (background: string) => {
  if (background.startsWith("linear-gradient") || background.startsWith("radial-gradient")) {
    return { backgroundImage: background };
  }
  return { backgroundColor: background };
};
