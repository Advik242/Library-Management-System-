// Simple rule-based chatbot
export const chatbot = async (req, res) => {
  try {
    const { message } = req.body;
    let reply = "Sorry, I didn't understand that.";

    if (/borrow limit/i.test(message)) {
      reply = `You can borrow up to ${req.user.getBorrowLimit()} books.`;
    } else if (/due date/i.test(message)) {
      reply = "You can check your due dates in the 'My Loans' section.";
    } else if (/recommend/i.test(message)) {
      reply = "Try our recommendation system to find books you may like!";
    }

    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Chatbot error' });
  }
};
