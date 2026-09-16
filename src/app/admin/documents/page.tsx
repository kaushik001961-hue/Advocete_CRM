import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DocumentTable from "./components/DocumentTable";
import DocumentFilters from "./components/DocumentFilters";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    clientId?: string;
    caseId?: string;
  }>;
}) {
  const {
    search = "",
    category = "",
    clientId = "",
    caseId = "",
  } = await searchParams;

  const cleanSearch = search.trim();

  const documents = await prisma.document.findMany({
    where: {
      ...(cleanSearch
        ? {
            name: {
              contains: cleanSearch,
              mode: "insensitive",
            },
          }
        : {}),

      ...(category
        ? {
            category,
          }
        : {}),

      ...(clientId
        ? {
            clientId,
          }
        : {}),

      ...(caseId
        ? {
            caseId,
          }
        : {}),
    },

    include: {
      client: true,
      case: true,
    },

    orderBy: {
      uploadedAt: "desc",
    },
  });

  /*
   * Clients for filter
   */
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  /*
   * Cases for dependent Client → Case dropdown
   */
  const cases = await prisma.case.findMany({
    select: {
      id: true,
      title: true,
      clientId: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const hasFilters =
    Boolean(cleanSearch) ||
    Boolean(category) ||
    Boolean(clientId) ||
    Boolean(caseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Documents
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage case documents, evidence, pleadings and court
            orders
          </p>
        </div>

        <Link
          href="/admin/documents/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Upload Document
        </Link>
      </div>

      {/* Filters */}
      <DocumentFilters
        clients={clients}
        cases={cases}
        search={search}
        category={category}
        clientId={clientId}
        caseId={caseId}
      />

      {/* Result summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {documents.length}
          </span>{" "}
          document{documents.length === 1 ? "" : "s"}
        </p>

        {hasFilters && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Filters Applied
          </span>
        )}
      </div>

      {/* Documents */}
      <DocumentTable documents={documents} />

      {/* Empty result */}
      {documents.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="text-4xl">📄</div>

          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            No documents found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filter options.
          </p>

          {hasFilters && (
            <Link
              href="/admin/documents"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Clear Filters
            </Link>
          )}
        </div>
      )}
    </div>
  );
}