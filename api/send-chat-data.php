<?php
// Set headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Load .env
require_once __DIR__ . '/env_loader.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

$nama = $input['nama'] ?? '';
$email = $input['email'] ?? '';
$telepon = $input['telepon'] ?? '';
$kebutuhan = $input['kebutuhan'] ?? '';
$mode = $input['mode'] ?? 'logic';

// Validate required fields
if (empty($nama) || empty($email) || empty($telepon) || empty($kebutuhan)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

date_default_timezone_set('Asia/Jakarta');
$submittedAt = date('l, d F Y H:i') . ' WIB';

// --- Email 1: Notification to Admin ---
$toAdmin = 'barodabdillah313@gmail.com';
$subjectAdmin = "🤖 New Chat Lead: {$nama}";
$modeColor1 = ($mode === 'logic') ? '#0f172a' : '#fdf2f8'; // Gradient start info
$modeColor2 = ($mode === 'logic') ? '#1e293b' : '#fce7f3'; // Gradient end
$headingColor = ($mode === 'logic') ? '#22d3ee' : '#f43f5e';
$subheadingColor = ($mode === 'logic') ? '#94a3b8' : '#be123c';
$cleanPhone = preg_replace('/\D/', '', $telepon);
$waLink = "https://wa.me/{$cleanPhone}?text=Halo%20" . urlencode($nama) . ",%20terima%20kasih%20sudah%20menghubungi%20BEWHY.ID!";

$messageAdmin = "
<html>
<body>
    <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
        <div style=\"background: linear-gradient(135deg, {$modeColor1} 0%, {$modeColor2} 100%); padding: 30px; border-radius: 16px 16px 0 0;\">
            <h1 style=\"color: {$headingColor}; margin: 0; font-size: 24px;\">🤖 New Chat Lead</h1>
            <p style=\"color: {$subheadingColor}; margin: 10px 0 0 0;\">Collected via AI Assistant (" . ($mode === 'logic' ? 'Logic Mode' : 'Satisfaction Mode') . ")</p>
        </div>
        
        <div style=\"background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;\">
            <table style=\"width: 100%; border-collapse: collapse;\">
                <tr>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0;\">
                        <strong style=\"color: #64748b;\">👤 Nama:</strong>
                    </td>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;\">
                        <span style=\"color: #0f172a; font-weight: 600; font-size: 16px;\">{$nama}</span>
                    </td>
                </tr>
                <tr>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0;\">
                        <strong style=\"color: #64748b;\">📧 Email:</strong>
                    </td>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;\">
                        <a href=\"mailto:{$email}\" style=\"color: #3b82f6; font-weight: 600;\">{$email}</a>
                    </td>
                </tr>
                <tr>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0;\">
                        <strong style=\"color: #64748b;\">📱 Telepon:</strong>
                    </td>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;\">
                        <a href=\"https://wa.me/{$cleanPhone}\" style=\"color: #22c55e; font-weight: 600;\">{$telepon}</a>
                    </td>
                </tr>
                <tr>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0;\" colspan=\"2\">
                        <strong style=\"color: #64748b;\">📝 Kebutuhan:</strong>
                        <p style=\"color: #0f172a; margin: 8px 0 0 0; line-height: 1.6;\">{$kebutuhan}</p>
                    </td>
                </tr>
                <tr>
                    <td style=\"padding: 12px 0;\">
                        <strong style=\"color: #64748b;\">📅 Submitted At:</strong>
                    </td>
                    <td style=\"padding: 12px 0; text-align: right;\">
                        <span style=\"color: #0f172a;\">{$submittedAt}</span>
                    </td>
                </tr>
            </table>
            
            <div style=\"margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;\">
                <p style=\"margin: 0; color: #065f46; font-size: 14px;\">
                    💡 <strong>Action Required:</strong> Follow up with this lead via email or WhatsApp.
                </p>
            </div>

            <div style=\"margin-top: 16px; text-align: center;\">
                <a href=\"{$waLink}\" 
                   style=\"display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 8px;\">
                    💬 Chat via WhatsApp
                </a>
                <a href=\"mailto:{$email}\" 
                   style=\"display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;\">
                    📧 Reply via Email
                </a>
            </div>
        </div>
        
        <p style=\"text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;\">
            This lead was collected from BEWHY.ID AI Assistant
        </p>
    </div>
</body>
</html>
";

// --- Email 2: Thank You to Client ---
$toClient = $email;
$subjectClient = '🙏 Terima Kasih Telah Menghubungi BEWHY.ID!';
$messageClient = "
<html>
<body>
    <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">
        <div style=\"background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;\">
            <h1 style=\"color: #ffffff; margin: 0; font-size: 28px;\">Terima Kasih, {$nama}! 🎉</h1>
            <p style=\"color: #94a3b8; margin: 15px 0 0 0; font-size: 16px;\">Pesan Anda telah kami terima</p>
        </div>
        
        <div style=\"background: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;\">
            <p style=\"color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;\">
                Halo <strong>{$nama}</strong>,
            </p>
            
            <p style=\"color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;\">
                Terima kasih sudah menghubungi <strong>BEWHY.ID</strong>! 🙏
            </p>
            
            <p style=\"color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;\">
                Kami sudah menerima informasi kebutuhan Anda dan akan segera menghubungi melalui email atau WhatsApp dalam waktu <strong>1x24 jam</strong>.
            </p>

            <div style=\"background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 24px 0;\">
                <p style=\"color: #64748b; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;\">📋 Ringkasan Data Anda:</p>
                <table style=\"width: 100%; border-collapse: collapse;\">
                    <tr>
                        <td style=\"color: #64748b; padding: 4px 0;\">Nama:</td>
                        <td style=\"color: #0f172a; font-weight: 500; text-align: right;\">{$nama}</td>
                    </tr>
                    <tr>
                        <td style=\"color: #64748b; padding: 4px 0;\">Email:</td>
                        <td style=\"color: #0f172a; font-weight: 500; text-align: right;\">{$email}</td>
                    </tr>
                    <tr>
                        <td style=\"color: #64748b; padding: 4px 0;\">Telepon:</td>
                        <td style=\"color: #0f172a; font-weight: 500; text-align: right;\">{$telepon}</td>
                    </tr>
                    <tr>
                        <td style=\"color: #64748b; padding: 4px 0; vertical-align: top;\">Kebutuhan:</td>
                        <td style=\"color: #0f172a; font-weight: 500; text-align: right;\">{$kebutuhan}</td>
                    </tr>
                </table>
            </div>
            
            <p style=\"color: #334155; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;\">
                Jika ada pertanyaan mendesak, silakan langsung hubungi saya melalui WhatsApp atau balas email ini.
            </p>
            
            <p style=\"color: #334155; font-size: 16px; line-height: 1.8; margin: 30px 0 0 0;\">
                Salam hangat,<br/>
                <strong style=\"color: #0f172a;\">Barod Yoedistira</strong><br/>
                <span style=\"color: #64748b; font-size: 14px;\">Hybrid Solution Architect</span>
            </p>
        </div>
        
        <p style=\"text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;\">
            Email ini dikirim otomatis dari sistem BEWHY.ID
        </p>
    </div>
</body>
</html>
";

// Common Headers
$from = getenv('MAIL_FROM_ADDRESS') ?: 'noreply@cuma.click';
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: \"BEWHY.ID Website\" <{$from}>" . "\r\n";
$headers .= "Reply-To: {$from}" . "\r\n";

// Override From for Client email to be personal?
// Actually standard is better to avoid spam.
// We'll use the same From address.

// Send emails
$adminSent = mail($toAdmin, $subjectAdmin, $messageAdmin, $headers);
$clientSent = mail($toClient, $subjectClient, $messageClient, $headers);

if ($adminSent && $clientSent) {
    echo json_encode(["success" => true, "message" => "Emails sent successfully"]);
} else if ($adminSent || $clientSent) {
    // Partial success
    echo json_encode(["success" => true, "message" => "Some emails sent successfully", "admin" => $adminSent, "client" => $clientSent]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to send email"]);
}
?>
