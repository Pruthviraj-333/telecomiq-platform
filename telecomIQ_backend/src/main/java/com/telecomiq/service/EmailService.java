package com.telecomiq.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.resend.api-key:}")
    private String resendApiKey;

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        if (!mailEnabled) {
            log.info("Email disabled. Would have sent to={}, subject={}", to, subject);
            return;
        }

        if (resendApiKey == null || resendApiKey.trim().isEmpty()) {
            log.warn("Resend API Key is empty. Cannot send email to={}, subject={}", to, subject);
            return;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromEmail);
            payload.put("to", to);
            payload.put("subject", subject);
            payload.put("html", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.resend.com/emails",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent successfully via Resend API to={}, subject={}", to, subject);
            } else {
                log.error("Failed to send email via Resend API: Status={}, Body={}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Resend to={}, subject={}: {}", to, subject, e.getMessage());
        }
    }

    @Async
    public void sendTicketCreatedEmail(String to, String ticketTitle, Long ticketId) {
        String subject = "[TelecomIQ] Ticket #" + ticketId + " Created";
        String html = buildEmailTemplate(
                "Ticket Created",
                "Your support ticket has been created and is being analyzed by our AI system.",
                "<strong>Ticket ID:</strong> #" + ticketId + "<br/>" +
                "<strong>Title:</strong> " + ticketTitle + "<br/>" +
                "<strong>Status:</strong> OPEN"
        );
        sendEmail(to, subject, html);
    }

    @Async
    public void sendEscalationEmail(String to, String ticketTitle, Long ticketId, String reason) {
        String subject = "[TelecomIQ] ⚠️ Ticket #" + ticketId + " Escalated";
        String html = buildEmailTemplate(
                "Ticket Escalated",
                "A ticket has been escalated and requires immediate attention.",
                "<strong>Ticket ID:</strong> #" + ticketId + "<br/>" +
                "<strong>Title:</strong> " + ticketTitle + "<br/>" +
                "<strong>Escalation Reason:</strong> " + reason + "<br/>" +
                "<strong>Status:</strong> ESCALATED"
        );
        sendEmail(to, subject, html);
    }

    @Async
    public void sendCriticalTicketEmail(String to, String ticketTitle, Long ticketId) {
        String subject = "[TelecomIQ] 🚨 CRITICAL Ticket #" + ticketId + " Created";
        String html = buildEmailTemplate(
                "Critical Ticket Alert",
                "A CRITICAL priority ticket has been created and automatically escalated.",
                "<strong>Ticket ID:</strong> #" + ticketId + "<br/>" +
                "<strong>Title:</strong> " + ticketTitle + "<br/>" +
                "<strong>Priority:</strong> <span style='color:#dc2626;font-weight:bold;'>CRITICAL</span><br/>" +
                "<strong>Status:</strong> ESCALATED"
        );
        sendEmail(to, subject, html);
    }

    @Async
    public void sendEngineerAssignedEmail(String to, String engineerName, String ticketTitle, Long ticketId) {
        String subject = "[TelecomIQ] Ticket #" + ticketId + " Assigned to You";
        String html = buildEmailTemplate(
                "Ticket Assigned",
                "Hello " + engineerName + ", a ticket has been assigned to you.",
                "<strong>Ticket ID:</strong> #" + ticketId + "<br/>" +
                "<strong>Title:</strong> " + ticketTitle + "<br/>" +
                "<strong>Action Required:</strong> Please review and resolve this ticket."
        );
        sendEmail(to, subject, html);
    }

    @Async
    public void sendTicketResolvedEmail(String to, String ticketTitle, Long ticketId) {
        String subject = "[TelecomIQ] ✅ Ticket #" + ticketId + " Resolved";
        String html = buildEmailTemplate(
                "Ticket Resolved",
                "Your support ticket has been resolved.",
                "<strong>Ticket ID:</strong> #" + ticketId + "<br/>" +
                "<strong>Title:</strong> " + ticketTitle + "<br/>" +
                "<strong>Status:</strong> <span style='color:#16a34a;font-weight:bold;'>RESOLVED</span>"
        );
        sendEmail(to, subject, html);
    }

    private String buildEmailTemplate(String title, String subtitle, String content) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                  <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background:linear-gradient(135deg,#1e3a5f 0%%,#2563eb 100%%);padding:30px 40px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:24px;">🔧 TelecomIQ</h1>
                      <p style="color:#93c5fd;margin:8px 0 0 0;font-size:14px;">AI-Driven Incident Resolution</p>
                    </div>
                    <div style="padding:30px 40px;">
                      <h2 style="color:#1e3a5f;margin:0 0 8px 0;">%s</h2>
                      <p style="color:#64748b;margin:0 0 20px 0;">%s</p>
                      <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
                        %s
                      </div>
                    </div>
                    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="color:#94a3b8;font-size:12px;margin:0;">TelecomIQ Platform • Automated Notification</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(title, subtitle, content);
    }
}
