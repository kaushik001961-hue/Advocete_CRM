// src/utils/shareUtils.ts

/**
 * Standard Text/Link Sharing
 */
export async function shareContent(title: string, text: string, url?: string) {
  if (typeof window !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      return { success: true, method: "native" };
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
      }
      return { success: false };
    }
  } else if (typeof window !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}${url ? `\nLink: ${url}` : ""}`);
      return { success: true, method: "clipboard" };
    } catch (error) {
      console.error("Failed to copy text:", error);
      return { success: false };
    }
  }
  return { success: false };
}

/**
 * Clean Print/PDF Export Utility using Native Browser Print
 */
export async function generateAndSharePDF(elementId: string, caseTitle: string) {
  if (typeof window === "undefined") return { success: false };

  const element = document.getElementById(elementId);
  if (!element) return { success: false, message: "Element not found" };

  try {
    // Add print scoping class so CSS isolates only the case card
    document.body.classList.add("printing");

    // Open native browser print dialog (User can choose "Save as PDF")
    window.print();

    // Clean up scoping class
    document.body.classList.remove("printing");

    return { success: true, method: "print-pdf" };
  } catch (error) {
    document.body.classList.remove("printing");
    console.error("Error triggering print/PDF:", error);
    return { success: false };
  }
}