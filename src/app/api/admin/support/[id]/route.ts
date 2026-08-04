import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { SupportStatus } from "@prisma/client";
import { sendSupportReplyEmail } from "@/lib/mail";

// PATCH /api/admin/support/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user, "support")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await req.json();
    const { status, adminNotes, sendEmail, replyMessage } = body;

    const dataToUpdate: any = {};

    if (status !== undefined) {
      if (!Object.values(SupportStatus).includes(status as SupportStatus)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      dataToUpdate.status = status as SupportStatus;
    }

    if (adminNotes !== undefined) {
      dataToUpdate.adminNotes = adminNotes === null ? null : String(adminNotes);
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: dataToUpdate,
      include: {
        customer: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
            imageUrl: true,
            subscription: {
              select: {
                plan: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Send email notification to customer if requested
    if (sendEmail && (replyMessage || adminNotes)) {
      const textToSend = replyMessage || adminNotes;
      sendSupportReplyEmail({
        to: updatedTicket.email,
        customerName: updatedTicket.name,
        ticketId: updatedTicket.id,
        subject: updatedTicket.subject,
        originalMessage: updatedTicket.message,
        replyMessage: textToSend,
        status: updatedTicket.status,
      }).catch((err) => console.error("Async email error:", err));
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
