import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Email API endpoint
app.post('/api/send-email', async (req, res) => {
    try {
        const { phoneNumber, selectedTime, timeLabel } = req.body;

        // Validate required fields
        if (!phoneNumber || !selectedTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create transporter with SMTP settings
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.MAIL_PORT || '465'),
            secure: true, // SSL
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        // Format phone number
        const formattedPhone = phoneNumber.startsWith('+62')
            ? phoneNumber
            : `+62 ${phoneNumber}`;

        // Email content
        const mailOptions = {
            from: `"BAROD.Y Website" <${process.env.MAIL_FROM_ADDRESS || 'noreply@cuma.click'}>`,
            to: 'barodabdillah313@gmail.com',
            subject: '🚀 New Strategy Call Request',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 16px 16px 0 0;">
                        <h1 style="color: #22d3ee; margin: 0; font-size: 24px;">📞 New Strategy Call Request</h1>
                        <p style="color: #94a3b8; margin: 10px 0 0 0;">Someone wants to connect with you!</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                    <strong style="color: #64748b;">📱 Phone Number:</strong>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                    <span style="color: #0f172a; font-weight: 600; font-size: 16px;">${formattedPhone}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                    <strong style="color: #64748b;">⏰ Preferred Time:</strong>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                    <span style="color: #0f172a; font-weight: 600;">${timeLabel || selectedTime}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0;">
                                    <strong style="color: #64748b;">📅 Submitted At:</strong>
                                </td>
                                <td style="padding: 12px 0; text-align: right;">
                                    <span style="color: #0f172a;">${new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })} WIB</span>
                                </td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                            <p style="margin: 0; color: #065f46; font-size: 14px;">
                                💡 <strong>Action Required:</strong> Please contact this person within their preferred time slot.
                            </p>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                        This email was sent from BAROD.Y Portfolio Website
                    </p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`📧 Email API server running on http://localhost:${PORT}`);
});
