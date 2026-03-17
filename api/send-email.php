<?php
// Set headers for CORS and JSON content
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

// Load environment variables
require_once __DIR__ . '/env_loader.php';

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

$phoneNumber = $input['phoneNumber'] ?? '';
$selectedTime = $input['selectedTime'] ?? '';
$timeLabel = $input['timeLabel'] ?? '';

// Validate required fields
if (empty($phoneNumber) || empty($selectedTime)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

// Format phone number
$formattedPhone = (strpos($phoneNumber, '+62') === 0) ? $phoneNumber : '+62 ' . $phoneNumber;

$to = 'barodabdillah313@gmail.com'; // Recipient
$subject = '🚀 New Strategy Call Request';

// Date formatting
date_default_timezone_set('Asia/Jakarta');
$submittedAt = date('l, d F Y H:i') . ' WIB';

// HTML Message
$message = "
<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
</style>
</head>
<body>
    <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">
        <div style=\"background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 16px 16px 0 0;\">
            <h1 style=\"color: #22d3ee; margin: 0; font-size: 24px;\">📞 New Strategy Call Request</h1>
            <p style=\"color: #94a3b8; margin: 10px 0 0 0;\">Someone wants to connect with you!</p>
        </div>
        
        <div style=\"background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;\">
            <table style=\"width: 100%; border-collapse: collapse;\">
                <tr>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0;\">
                        <strong style=\"color: #64748b;\">📱 Phone Number:</strong>
                    </td>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;\">
                        <span style=\"color: #0f172a; font-weight: 600; font-size: 16px;\">{$formattedPhone}</span>
                    </td>
                </tr>
                <tr>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0;\">
                        <strong style=\"color: #64748b;\">⏰ Preferred Time:</strong>
                    </td>
                    <td style=\"padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;\">
                        <span style=\"color: #0f172a; font-weight: 600;\">" . ($timeLabel ?: $selectedTime) . "</span>
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
                    💡 <strong>Action Required:</strong> Please contact this person within their preferred time slot.
                </p>
            </div>
        </div>
        
        <p style=\"text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;\">
            This email was sent from BEWHY.ID Portfolio Website
        </p>
    </div>
</body>
</html>
";

// Headers
$from = getenv('MAIL_FROM_ADDRESS') ?: 'noreply@cuma.click';
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: \"BEWHY.ID Website\" <{$from}>" . "\r\n";
$headers .= "Reply-To: {$from}" . "\r\n";

// Attempts to send email
if(mail($to, $subject, $message, $headers)) {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Email sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to send email"]);
}
?>
