import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"BookNest Library" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};

export const sendDueDateReminder = async (loan) => {
  const daysUntilDue = Math.ceil(
    (loan.dueDate - new Date()) / (1000 * 60 * 60 * 24)
  );

  await sendEmail({
    to: loan.user.email,
    subject: `Reminder: Book due in ${daysUntilDue} days`,
    text: `Your book "${loan.book.title}" is due on ${loan.dueDate.toDateString()}. Please return it on time to avoid fines.`
  });
};

export const sendOverdueNotice = async (loan, fineAmount) => {
  await sendEmail({
    to: loan.user.email,
    subject: 'Overdue Book Notice',
    text: `Your book "${loan.book.title}" is overdue. Current fine: ₹${fineAmount}. Please return it immediately.`
  });
};
