const validText = (str: unknown): boolean => {
  return typeof str === "string" && str.trim().length > 0;
};

export default validText;
