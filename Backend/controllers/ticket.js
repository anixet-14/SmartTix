import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";
import { sendMail } from "../utils/mailer.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
      assignedTo, // array of moderator IDs
    });

    // Send Inngest event
    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    // Send email to assigned moderator(s)
    if (assignedTo && assignedTo.length > 0) {
      // Fetch moderators’ emails
      const moderators = await User.find({ _id: { $in: assignedTo } }).select("email");
      moderators.forEach(async (mod) => {
        try {
          await sendMail(
            mod.email,
            `New Ticket Assigned: ${title}`,
            `Hi Moderator,\n\nA new ticket has been assigned to you:\n\nTitle: ${title}\nDescription: ${description}\n\nPlease check the system to take action.`
          );
          console.log(`Email sent to ${mod.email}`);
        } catch (err) {
          console.error(`Failed to send email to ${mod.email}:`, err.message);
        }
      });
    }

    return res.status(201).json({
      message: "Ticket created and emails sent to assigned moderators",
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

    if (user.role === "admin") {
      // Admin: fetch all tickets
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else if (user.role === "moderator") {
      // Moderator: fetch tickets assigned to them
      tickets = await Ticket.find({ assignedTo: user._id })
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      // User: fetch tickets created by them
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    }

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

export const deleteTicket = async (req, res) => {
  try {
    const user = req.user; // comes from auth middleware
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // 🔐 Permission rules
    if (
      user.role === "admin" || // Admin can delete any ticket
      (user.role === "user" && ticket.createdBy.toString() === user._id.toString()) // User can delete their own
    ) {
      await ticket.deleteOne();
      return res.status(200).json({ message: "Ticket deleted successfully" });
    }

    // Moderators or unauthorized users
    return res.status(403).json({ message: "You are not authorized to delete this ticket" });
  } catch (error) {
    console.error("Error deleting ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
