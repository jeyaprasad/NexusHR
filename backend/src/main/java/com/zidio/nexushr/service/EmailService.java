package com.zidio.nexushr.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("HTML email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    public String wrapHtmlTemplate(String title, String contentBody) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>%s</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: #1a1a2e; color: #fff; padding: 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 20px; }
              .body { padding: 24px; color: #333; line-height: 1.6; }
              .footer { background: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #888; }
              .button { display: inline-block; padding: 10px 20px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 4px; }
            </style></head><body>
            <div class="container">
              <div class="header"><h1>%s</h1></div>
              <div class="body">%s</div>
              <div class="footer">© 2026 NexusHR Enterprise</div>
            </div></body></html>
            """.formatted(title, title, contentBody);
    }
}
