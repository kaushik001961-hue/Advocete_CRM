import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AppRole = "ADMIN" | "ADVOCATE" | "STAFF";

export type AuthContext = {
  userId: string;
  role: AppRole;
  email?: string | null;
};

function isAppRole(value: unknown): value is AppRole {
  return (
    value === "ADMIN" ||
    value === "ADVOCATE" ||
    value === "STAFF"
  );
}

/**
 * Get the currently authenticated user.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const session = await auth();

    if (!session?.user) {
      return null;
    }

    const user = session.user as typeof session.user & {
      id?: string;
      role?: unknown;
    };

    if (!user.id) {
      return null;
    }

    const role: AppRole = isAppRole(user.role)
      ? user.role
      : "ADVOCATE";

    return {
      userId: user.id,
      role,
      email: user.email ?? null,
    };
  } catch (error) {
    console.error("getAuthContext error:", error);
    return null;
  }
}

/**
 * ADMIN has unrestricted access.
 * STAFF can access operational records.
 * ADVOCATE can access only their assigned cases.
 */
export async function canAccessCase(
  caseId: string,
  context: AuthContext
): Promise<boolean> {
  if (!context?.userId) {
    return false;
  }

  if (context.role === "ADMIN" || context.role === "STAFF") {
    return true;
  }

  const record = await prisma.case.findUnique({
    where: {
      id: caseId,
    },
    select: {
      advocateId: true,
    },
  });

  if (!record) {
    return false;
  }

  return (
    context.role === "ADVOCATE" &&
    record.advocateId === context.userId
  );
}

/**
 * Client access.
 *
 * ADMIN / STAFF:
 *   All clients.
 *
 * ADVOCATE:
 *   Only clients who have at least one case assigned
 *   to the logged-in advocate.
 */
export async function canAccessClient(
  clientId: string,
  context: AuthContext
): Promise<boolean> {
  if (!context?.userId) {
    return false;
  }

  if (context.role === "ADMIN" || context.role === "STAFF") {
    return true;
  }

  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
    select: {
      cases: {
        where: {
          advocateId: context.userId,
        },
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  return Boolean(client && client.cases.length > 0);
}

/**
 * Invoice access.
 *
 * ADMIN / STAFF:
 *   All invoices.
 *
 * ADVOCATE:
 *   Only invoices belonging to a client connected to
 *   one of the advocate's assigned cases.
 */
export async function canAccessInvoice(
  invoiceId: string,
  context: AuthContext
): Promise<boolean> {
  if (!context?.userId) {
    return false;
  }

  if (context.role === "ADMIN" || context.role === "STAFF") {
    return true;
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      clientId: true,
    },
  });

  if (!invoice) {
    return false;
  }

  if (!invoice.clientId) {
    return false;
  }

  return canAccessClient(invoice.clientId, context);
}

/**
 * Financial management permissions.
 *
 * ADMIN:
 *   Full financial management.
 *
 * STAFF:
 *   Operational financial management.
 *
 * ADVOCATE:
 *   Can view permitted invoices but cannot manage
 *   financial records.
 */
export function canManageFinance(role: AppRole): boolean {
  return role === "ADMIN" || role === "STAFF";
}

/**
 * Task access.
 *
 * ADMIN / STAFF:
 *   All operational tasks.
 *
 * ADVOCATE:
 *   Only tasks assigned to that advocate.
 */
export async function canAccessTask(
  taskId: string,
  context: AuthContext
): Promise<boolean> {
  if (!context?.userId) {
    return false;
  }

  if (context.role === "ADMIN" || context.role === "STAFF") {
    return true;
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      assignedTo: true,
    },
  });

  if (!task) {
    return false;
  }

  return (
    context.role === "ADVOCATE" &&
    task.assignedTo === context.userId
  );
}

/**
 * CASE CREATE permission.
 *
 * ADMIN / STAFF:
 *   Can create cases.
 *
 * ADVOCATE:
 *   Cannot create a new case from the general API.
 */
export function canCreateCase(role: AppRole): boolean {
  return role === "ADMIN" || role === "STAFF";
}

/**
 * CASE DELETE permission.
 *
 * IMPORTANT:
 * Only ADMIN can delete a case.
 *
 * STAFF and ADVOCATE are explicitly denied.
 */
export function canDeleteCase(role: AppRole): boolean {
  return role === "ADMIN";
}

/**
 * Generic record deletion permission.
 *
 * Only ADMIN can delete records.
 *
 * This is intentionally separate from canDeleteCase so it can
 * be reused by documents, evidence, clients, invoices, etc.
 */
export function canDeleteRecords(role: AppRole): boolean {
  return role === "ADMIN";
}

/**
 * Prisma WHERE filter for cases.
 *
 * ADMIN:
 *   All cases.
 *
 * STAFF:
 *   All operational cases.
 *
 * ADVOCATE:
 *   Only cases assigned to the logged-in advocate.
 */
export function caseWhereForUser(
  context: AuthContext
) {
  if (context.role === "ADMIN" || context.role === "STAFF") {
    return {};
  }

  return {
    advocateId: context.userId,
  };
}

/**
 * Prisma WHERE filter for clients.
 *
 * ADMIN / STAFF:
 *   All clients.
 *
 * ADVOCATE:
 *   Only clients connected to the advocate's cases.
 */
export function clientWhereForUser(
  context: AuthContext
) {
  if (context.role === "ADMIN" || context.role === "STAFF") {
    return {};
  }

  return {
    cases: {
      some: {
        advocateId: context.userId,
      },
    },
  };
}

/**
 * Prisma WHERE filter for documents.
 *
 * ADMIN / STAFF:
 *   All documents.
 *
 * ADVOCATE:
 *   Documents belonging to:
 *     1. Their assigned case, OR
 *     2. A client who has a case assigned to them.
 *
 * This prevents the Advocate Documents and Evidence pages
 * from displaying documents belonging to another advocate.
 */
export function documentWhereForUser(
  context: AuthContext
) {
  if (context.role === "ADMIN" || context.role === "STAFF") {
    return {};
  }

  return {
    OR: [
      {
        case: {
          advocateId: context.userId,
        },
      },
      {
        client: {
          cases: {
            some: {
              advocateId: context.userId,
            },
          },
        },
      },
    ],
  };
}

/**
 * Prisma WHERE filter for invoices.
 *
 * ADMIN / STAFF:
 *   All invoices.
 *
 * ADVOCATE:
 *   Only invoices belonging to clients connected to
 *   their assigned cases.
 */
export function invoiceWhereForUser(
  context: AuthContext
) {
  if (context.role === "ADMIN" || context.role === "STAFF") {
    return {};
  }

  return {
    client: {
      cases: {
        some: {
          advocateId: context.userId,
        },
      },
    },
  };
}

/**
 * Prisma WHERE filter for tasks.
 *
 * ADMIN / STAFF:
 *   All tasks.
 *
 * ADVOCATE:
 *   Only tasks assigned to that advocate.
 */
export function taskWhereForUser(
  context: AuthContext
) {
  if (context.role === "ADMIN" || context.role === "STAFF") {
    return {};
  }

  return {
    assignedTo: context.userId,
  };
}