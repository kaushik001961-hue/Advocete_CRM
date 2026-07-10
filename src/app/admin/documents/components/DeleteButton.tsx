"use client";

export default function DeleteButton({
  id,
}: {
  id: string;
}) {
  const handleDelete = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    alert(`Delete document: ${id}`);

    // Later:
    // await fetch(`/api/documents/${id}`, {
    //   method: "DELETE",
    // });
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}