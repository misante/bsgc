// Text formatting utilities
export const formatText = {
  // Capitalize first letter of each word
  capitalize: (str) => {
    if (!str) return "";
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  // Format equipment name with proper capitalization
  formatEquipmentName: (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => {
        // Handle common acronyms
        const acronyms = ["CAT", "SOP", "BSGC"];
        if (acronyms.includes(word.toUpperCase())) {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  },

  // Format type with capitalization
  formatType: (type) => {
    if (!type) return "";
    return type
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  },
};
