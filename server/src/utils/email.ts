import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface InquiryEmailOptions {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  propertyTitle: string;
  propertyId: string;
  message: string;
}

export const sendInquiryEmail = async (opts: InquiryEmailOptions): Promise<boolean> => {
  try {
    const propertyUrl = `${process.env.FRONTEND_URL}/properties/${opts.propertyId}`;
    await transporter.sendMail({
      from: `"Boam Real-Estates" <${process.env.EMAIL_USER}>`,
      to: opts.sellerEmail,
      subject: `New Inquiry for "${opts.propertyTitle}" – Boam Real-Estates`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">Boam Real-Estates</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">New Property Inquiry</p>
          </div>
          <div style="padding:40px;background:white;">
            <p style="color:#374151;font-size:16px;margin-top:0;">Hi <strong>${opts.sellerName}</strong>,</p>
            <p style="color:#6b7280;font-size:15px;">You have received a new inquiry for your listing:</p>
            <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;padding:16px 20px;margin:20px 0;">
              <p style="margin:0;color:#1e40af;font-size:15px;font-weight:600;">${opts.propertyTitle}</p>
              <a href="${propertyUrl}" style="color:#3b82f6;font-size:13px;text-decoration:none;">View Listing →</a>
            </div>
            <h3 style="color:#111827;font-size:15px;margin-bottom:12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Buyer Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;">Name</td><td style="padding:8px 0;color:#111827;font-weight:500;">${opts.buyerName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;"><a href="mailto:${opts.buyerEmail}" style="color:#2563eb;">${opts.buyerEmail}</a></td></tr>
              ${opts.buyerPhone ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:8px 0;"><a href="tel:${opts.buyerPhone}" style="color:#2563eb;">${opts.buyerPhone}</a></td></tr>` : ''}
            </table>
            <h3 style="color:#111827;font-size:15px;margin-top:24px;margin-bottom:12px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Message</h3>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;color:#374151;font-size:14px;line-height:1.7;">${opts.message.replace(/\n/g, '<br>')}</div>
            <div style="text-align:center;margin-top:32px;">
              <a href="mailto:${opts.buyerEmail}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">Reply to ${opts.buyerName}</a>
            </div>
          </div>
          <div style="padding:20px 40px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">This message was sent via Boam Real-Estates.</p>
          </div>
        </div>`,
    });
    return true;
  } catch (error) {
    console.error('Failed to send inquiry email:', error);
    return false;
  }
};

export const sendInquiryConfirmationEmail = async (opts: {
  buyerEmail: string;
  buyerName: string;
  propertyTitle: string;
  propertyId: string;
}): Promise<void> => {
  try {
    const propertyUrl = `${process.env.FRONTEND_URL}/properties/${opts.propertyId}`;
    await transporter.sendMail({
      from: `"Boam Real-Estates" <${process.env.EMAIL_USER}>`,
      to: opts.buyerEmail,
      subject: `Your inquiry for "${opts.propertyTitle}" was sent!`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 40px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">&#10003; Inquiry Sent!</h1>
          </div>
          <div style="padding:40px;background:white;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;">
            <p style="color:#374151;font-size:15px;">Hi <strong>${opts.buyerName}</strong>,</p>
            <p style="color:#6b7280;line-height:1.6;">Your inquiry about <strong>"${opts.propertyTitle}"</strong> has been sent to the property owner. They will contact you soon.</p>
            <div style="text-align:center;margin-top:24px;">
              <a href="${propertyUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">View Property</a>
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:32px;">Boam Real-Estates — Connecting Buyers &amp; Sellers</p>
          </div>
        </div>`,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
};

export interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (opts: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"Boam Real-Estates" <${process.env.EMAIL_USER}>`,
    to: opts.email,
    subject: opts.subject,
    text: opts.message,
  });
};

export interface PropertyRequestEmailOptions {
  lookingFor: string;
  district: string;
  customArea?: string;
  minBudget?: number;
  maxBudget?: number;
  sizeInPerches?: number;
  name: string;
  email: string;
  phone: string;
  note?: string;
}

export const sendPropertyRequestNotificationEmail = async (opts: PropertyRequestEmailOptions): Promise<boolean> => {
  try {
    const recipients = ['anilbwt26@yahoo.com', 'erangabowatte@gmail.com'];
    const budgetStr = opts.minBudget || opts.maxBudget
      ? `${opts.minBudget ? `Min: LKR ${opts.minBudget.toLocaleString()}` : ''} ${opts.maxBudget ? `Max: LKR ${opts.maxBudget.toLocaleString()}` : ''}`
      : 'Not specified';

    await transporter.sendMail({
      from: `"Boam Real-Estates" <${process.env.EMAIL_USER}>`,
      to: recipients.join(', '),
      subject: `New Property Request: ${opts.lookingFor} in ${opts.district}${opts.customArea ? ` (${opts.customArea})` : ''}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#0e2a49 0%,#1e3a5f 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#f59e0b;margin:0;font-size:24px;font-weight:800;">BOAM Real-Estates</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;font-weight:600;">New Buyer Property Request</p>
          </div>
          <div style="padding:32px;background:white;">
            <div style="background:#fffbe6;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;color:#92400e;font-size:15px;font-weight:700;">
                Looking for: ${opts.lookingFor}
              </p>
              <p style="margin:4px 0 0;color:#b45309;font-size:14px;">
                Location: ${opts.district} ${opts.customArea ? `(${opts.customArea})` : ''}
              </p>
            </div>

            <h3 style="color:#0f172a;font-size:16px;margin-bottom:12px;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Request Summary</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;width:140px;font-weight:600;">Looking For</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;">${opts.lookingFor}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">District / Area</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;">${opts.district} ${opts.customArea ? `— ${opts.customArea}` : ''}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">Budget Range</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;">${budgetStr}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">Size Needed</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;">${opts.sizeInPerches ? `${opts.sizeInPerches} perches` : 'Not specified'}</td>
              </tr>
            </table>

            <h3 style="color:#0f172a;font-size:16px;margin-bottom:12px;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Visitor Contact Information</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;width:140px;font-weight:600;">Name</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;">${opts.name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">Email</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;"><a href="mailto:${opts.email}" style="color:#2563eb;text-decoration:none;">${opts.email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;">Phone</td>
                <td style="padding:10px 0;color:#0f172a;font-size:14px;"><a href="tel:${opts.phone}" style="color:#2563eb;text-decoration:none;">${opts.phone}</a></td>
              </tr>
            </table>

            ${opts.note ? `
              <h3 style="color:#0f172a;font-size:16px;margin-bottom:12px;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Additional Notes</h3>
              <div style="background:#f8fafc;border-radius:8px;padding:16px;color:#334155;font-size:14px;line-height:1.7;">
                ${opts.note.replace(/\n/g, '<br>')}
              </div>
            ` : ''}

            <div style="text-align:center;margin-top:32px;">
              <a href="mailto:${opts.email}" style="display:inline-block;background:#0e2a49;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;">Contact ${opts.name}</a>
            </div>
          </div>
          <div style="padding:20px;text-align:center;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">Submitted via BOAM Real-Estates Request Portal</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send property request email:', error);
    return false;
  }
};

