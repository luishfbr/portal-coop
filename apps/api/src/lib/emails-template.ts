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
    text: `Clique no seguinte link para redefinir sua senha. ${url}`,
  });
}
