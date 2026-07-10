"use client";

import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

  return (
    <input
      placeholder="Search Documents..."
      onChange={(e) =>
        router.push(
          `/admin/documents?search=${e.target.value}`
        )
      }
      className="w-full border rounded-lg px-4 py-3 bg-white"
    />
  );
}