"use client";

export default function DocumentPreview({
  url,
}: {
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      Preview
    </a>
  );
}