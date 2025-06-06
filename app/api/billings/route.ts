import { NextResponse } from "next/server";
import mockBillings from "@/app/data/mock-billings.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const service = searchParams.get("service") || "all";
  const date = searchParams.get("date") || "";

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Filter billings based on search term and filters
  const filteredBillings = mockBillings.billings.filter((billing) => {
    const matchesSearch =
      billing.customerName.toLowerCase().includes(search.toLowerCase()) ||
      billing.invoiceNumber.toLowerCase().includes(search.toLowerCase());

    const matchesService =
      service === "all" || billing.serviceDetails.description === service;

    const matchesDate = date === "" || billing.serviceDetails.date === date;

    return matchesSearch && matchesService && matchesDate;
  });

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const paginatedBillings = filteredBillings.slice(
    startIndex,
    startIndex + limit
  );

  // Get unique service types for filter options
  const serviceTypes = Array.from(
    new Set(mockBillings.billings.map((b) => b.serviceDetails.description))
  );

  return NextResponse.json({
    billings: paginatedBillings,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredBillings.length / limit),
      totalItems: filteredBillings.length,
      itemsPerPage: limit,
    },
    filters: {
      serviceTypes,
    },
  });
}
