export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Please upload an image smaller than 2MB."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that file. Please try again."));
    reader.readAsDataURL(file);
  });
}
