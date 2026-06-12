import { env } from "./env";
import { transporter } from "./transporter";

export async function SendResetPasswordEmail({
  url,
  email,
}: {
  url: string;
  email: string;
}) {
  await transporter.sendMail({
    from: env.SMTP_MAIL_FROM,
    to: email,
    subject: "Link para redefinição de senha - Portal Coop",
    text: `Clique no seguinte link para redefinir sua senha: ${url}\n\nEste link expira em 30 minutos. Se você não solicitou a redefinição, ignore este e-mail.`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:8px;padding:32px;border:1px solid #e4e4e7">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:.05em">Portal Coop</p>
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#09090b">Redefinição de senha</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#3f3f46;line-height:1.6">
            Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
          </p>
          <a href="${url}" style="display:inline-block;padding:10px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500">
            Redefinir senha
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;line-height:1.6">
            Este link expira em <strong>30 minutos</strong>. Se você não solicitou a redefinição, ignore este e-mail — sua senha permanece inalterada.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
