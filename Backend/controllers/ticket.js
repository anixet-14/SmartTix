import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = Ticket.create({
      title,
      description,
      createdBy: req.user._id,
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: (await newTicket)._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      // Admins and moderators: fetch all tickets
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      // Normal users: fetch their own tickets and include assignedTo
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", ["email", "_id"]) // ✅ Populate assignedTo
        .select("title description status createdAt assignedTo") // ✅ Include assignedTo
        .sort({ createdAt: -1 });
    }

    // Return tickets inside an object
    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



// export const getTickets = async (req, res) => {
//   try {
//     const user = req.user;
//     let tickets = [];
//     if (user.role !== "user") {
//       tickets = await Ticket.find({})
//         .populate("assignedTo", ["email", "_id"])
//         .sort({ createdAt: -1 });
//     } else {
//       tickets = await Ticket.find({ createdBy: user._id })
//         .select("title description status createdAt")
//         .sort({ createdAt: -1 });
//     }
//     return res.status(200).json(tickets);
//   } catch (error) {
//     console.error("Error fetching tickets", error.message);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// export const getTicket = async (req, res) => {
//   try {
//     const user = req.user;
//     let ticket;

//     if (user.role !== "user") {
//       ticket = Ticket.findById(req.params.id).populate("assignedTo", [
//         "email",
//         "_id",
//       ]);
//     } else {
//       ticket = Ticket.findOne({
//         createdBy: user._id,
//         _id: req.params.id,
//       }).select("title description status createdAt");
//     }

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }
//     return res.status(200).json({ ticket });
//   } catch (error) {
//     console.error("Error fetching ticket", error.message);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).populate("assignedTo", ["email", "_id"]); 
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;
    const user = req.user;

    // Only moderators and admins can update status
    if (!['moderator', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.status = status;
    await ticket.save();

    return res.json({ message: "Status updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
