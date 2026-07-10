import { prisma } from "@/lib/prisma";

import Link from "next/link";

import SearchBar from "./components/SearchBar";
import DocumentTable from "./components/DocumentTable";



export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
  }>;
}) {
  const { search = "" } = await searchParams;

  const documents =
    await prisma.document.findMany({

      where: {

        name: {

          contains: search,

          mode: "insensitive",

        },

      },

      include: {

        client: true,

        case: true,

      },

      orderBy: {

        uploadedAt: "desc",

      },

    });

  return (

    <div className="space-y-6">

      <div className="flex justify-between">

        <h1 className="text-3xl font-bold">

          Documents

        </h1>

        <Link
          href="/admin/documents/new"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Upload
        </Link>

      </div>

      <SearchBar />

      <DocumentTable
        documents={documents}
      />

    </div>

  );

}
