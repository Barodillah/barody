import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { nama, email, telepon, kebutuhan, mode } = req.body;

        // Validate required fields
        if (!nama || !email || !telepon || !kebutuhan) {
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

        const submittedAt = new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Email 1: Notification to Admin
        const adminMailOptions = {
            from: `"BAROD.Y Website" <${process.env.MAIL_FROM_ADDRESS || 'noreply@cuma.click'}>`,
            to: 'barodabdillah313@gmail.com',
            subject: `🤖 New Chat Lead: ${nama}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, ${mode === 'logic' ? '#0f172a 0%, #1e293b' : '#fdf2f8 0%, #fce7f3'} 100%); padding: 30px; border-radius: 16px 16px 0 0;">
                        <h1 style="color: ${mode === 'logic' ? '#22d3ee' : '#f43f5e'}; margin: 0; font-size: 24px;">🤖 New Chat Lead</h1>
                        <p style="color: ${mode === 'logic' ? '#94a3b8' : '#be123c'}; margin: 10px 0 0 0;">Collected via AI Assistant (${mode === 'logic' ? 'Logic Mode' : 'Satisfaction Mode'})</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                    <strong style="color: #64748b;">👤 Nama:</strong>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                    <span style="color: #0f172a; font-weight: 600; font-size: 16px;">${nama}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                    <strong style="color: #64748b;">📧 Email:</strong>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                    <a href="mailto:${email}" style="color: #3b82f6; font-weight: 600;">${email}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                    <strong style="color: #64748b;">📱 Telepon:</strong>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                    <a href="https://wa.me/${telepon.replace(/\D/g, '')}" style="color: #22c55e; font-weight: 600;">${telepon}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;" colspan="2">
                                    <strong style="color: #64748b;">📝 Kebutuhan:</strong>
                                    <p style="color: #0f172a; margin: 8px 0 0 0; line-height: 1.6;">${kebutuhan}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0;">
                                    <strong style="color: #64748b;">📅 Submitted At:</strong>
                                </td>
                                <td style="padding: 12px 0; text-align: right;">
                                    <span style="color: #0f172a;">${submittedAt} WIB</span>
                                </td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                            <p style="margin: 0; color: #065f46; font-size: 14px;">
                                💡 <strong>Action Required:</strong> Follow up with this lead via email or WhatsApp.
                            </p>
                        </div>

                        <div style="margin-top: 16px; text-align: center;">
                            <a href="https://wa.me/${telepon.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(nama)},%20terima%20kasih%20sudah%20menghubungi%20BAROD.Y!" 
                               style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;">
                                💬 Chat via WhatsApp
                            </a>
                            <a href="mailto:${email}" 
                               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                                📧 Reply via Email
                            </a>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                        This lead was collected from BAROD.Y AI Assistant
                    </p>
                </div>
            `,
        };

        // Email 2: Thank You to Client
        const clientMailOptions = {
            from: `"Barod Yoedistira" <${process.env.MAIL_FROM_ADDRESS || 'noreply@cuma.click'}>`,
            to: email,
            subject: '🙏 Terima Kasih Telah Menghubungi BAROD.Y!',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Terima Kasih, ${nama}! 🎉</h1>
                        <p style="color: #94a3b8; margin: 15px 0 0 0; font-size: 16px;">Pesan Anda telah kami terima</p>
                    </div>
                    
                    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
                        <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                            Halo <strong>${nama}</strong>,
                        </p>
                        
                        <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                            Terima kasih sudah menghubungi <strong>BAROD.Y</strong>! 🙏
                        </p>
                        
                        <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                            Kami sudah menerima informasi kebutuhan Anda dan akan segera menghubungi melalui email atau WhatsApp dalam waktu <strong>1x24 jam</strong>.
                        </p>

                        <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 24px 0;">
                            <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📋 Ringkasan Data Anda:</p>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="color: #64748b; padding: 4px 0;">Nama:</td>
                                    <td style="color: #0f172a; font-weight: 500; text-align: right;">${nama}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748b; padding: 4px 0;">Email:</td>
                                    <td style="color: #0f172a; font-weight: 500; text-align: right;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748b; padding: 4px 0;">Telepon:</td>
                                    <td style="color: #0f172a; font-weight: 500; text-align: right;">${telepon}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748b; padding: 4px 0; vertical-align: top;">Kebutuhan:</td>
                                    <td style="color: #0f172a; font-weight: 500; text-align: right;">${kebutuhan}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                            Jika ada pertanyaan mendesak, silakan langsung hubungi saya melalui WhatsApp atau balas email ini.
                        </p>
                        
                        <p style="color: #334155; font-size: 16px; line-height: 1.8; margin: 30px 0 0 0;">
                            Salam hangat,<br/>
                            <strong style="color: #0f172a;">Barod Yoedistira</strong><br/>
                            <span style="color: #64748b; font-size: 14px;">Hybrid Solution Architect</span>
                        </p>
                    </div>
                    
                    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                        Email ini dikirim otomatis dari sistem BAROD.Y
                    </p>
                </div>
            `,
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(clientMailOptions)
        ]);

        return res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
}
