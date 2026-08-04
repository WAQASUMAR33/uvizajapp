import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/support?customerId=123
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerIdStr = searchParams.get("customerId");

    if (!customerIdStr) {
      return NextResponse.json(
        { error: "customerId query parameter is required" },
        { status: 400 }
      );
    }

    const customerId = parseInt(customerIdStr, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customerId parameter" },
        { status: 400 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/support
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { customerId, name, email, phone, subject, message } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let parsedCustomerId: number | null = null;
    if (customerId) {
      parsedCustomerId = parseInt(customerId, 10);
      if (isNaN(parsedCustomerId)) parsedCustomerId = null;
    }

    // If customerId is provided, pre-fill name/email/phone from Customer if missing
    if (parsedCustomerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: parsedCustomerId },
      });
      if (customer) {
        if (!name) name = customer.fullname;
        if (!email) email = customer.email;
        if (!phone) phone = customer.phoneNumber ?? null;
      }
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      name = email.split("@")[0] || "Member";
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        customerId: parsedCustomerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        status: "PENDING",
      },
      include: {
        customer: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Support message sent successfully",
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
