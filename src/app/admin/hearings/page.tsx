
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HearingTable from "@/components/hearings/HearingTable";

export default async function HearingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}) {

  const params = await searchParams;

  const search = params.search || "";

  const page = Number(
    params.page || 1
  );

  const pageSize = 10;

  const hearings =
    await prisma.hearing.findMany({

      where: {

        OR: [

          {
            case: {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
          },

          {
            case: {
              client: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },

        ],

      },

      include: {

        case: {

          include: {

            client: true,

          },

        },

      },

      orderBy: {

        date: "asc",

      },

      skip: (page - 1) * pageSize,

      take: pageSize,

    });

  const total =
    await prisma.hearing.count();

  const totalPages =
    Math.ceil(
      total / pageSize
    );

  return (

    <div>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Hearings
        </h1>

        <Link
          href="/admin/hearings/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Schedule Hearing
        </Link>

      </div>

      <form className="mb-6">

        <input
          name="search"
          defaultValue={search}
          placeholder="Search case or client..."
          className="border rounded-lg p-3 w-80"
        />

      </form>

      <HearingTable
        hearings={hearings}
      />

      <div className="flex gap-3 mt-8">

        {Array.from({
          length: totalPages,
        }).map((_, index) => (

          <Link
            key={index}
            href={`?page=${index + 1}&search=${search}`}
            className={`px-4 py-2 rounded-lg
            ${
              page === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </Link>

        ))}

      </div>

    </div>

  );

}
