import Link from "next/link";

export default function DocumentPreview({
  url,
}: {
  url: string | undefined; // Made optional to prevent TS errors if it's missing
}) {
  // 1. Guard clause: Handle the case where url is undefined or empty
  if (!url) {
    return <span className="text-gray-400 italic text-sm">No preview available</span>;
  }

  // 2. Safe check using optional chaining (?.)
  const isImage =
    url?.endsWith(".png") ||
    url?.endsWith(".jpg") ||
    url?.endsWith(".jpeg") ||
    url?.endsWith(".webp");

  if (isImage) {
    return (
      <img
        src={url}
        alt="Document preview"
        className="w-20 rounded"
      />
    );
  }

  return (
    <Link
      href={url}
      target="_blank"
      className="text-blue-600 underline"
    >
      Preview
    </Link>
  );
}