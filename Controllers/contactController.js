import Contact from "../Models/Contact.js";

// ─── CREATE CONTACT ───────────────────────────────────────────────────────────

export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      data: contact,
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── GET ALL CONTACTS ─────────────────────────────────────────────────────────

export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [contacts, total] = await Promise.all([
      Contact.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contact.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: contacts,
      message: "Contacts fetched successfully",
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── GET CONTACT BY ID ────────────────────────────────────────────────────────

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
      message: "Contact fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── DELETE CONTACT ───────────────────────────────────────────────────────────

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};