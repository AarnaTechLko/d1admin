// email-service.ts - Server-side only email functionality
import { SESClient, SendEmailCommand, SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { unsubscribes } from './schema';
import { eq } from 'drizzle-orm';
import { BASE_TEMPLATE } from './templates/email-templates';

// Type definitions
interface SendEmailParams {
  to: string;
  cc?: string | null;
  subject: string;
  text?: string;
  html: string;
  unsubscribeLink?: string;
}

// Initialize AWS SES client
const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-2' });

export async function sendEmail({
  to,
  cc,
  subject,
  text,
  html,
}: SendEmailParams): Promise<
  { email: string; success: boolean; info?: SendEmailCommandOutput; error?: Error | unknown }[]
> {
  const toList = Array.isArray(to) ? [...to] : [to];

  const results: {
    email: string;
    success: boolean;
    info?: SendEmailCommandOutput;
    error?: Error | unknown;
  }[] = [];

  for (const recipient of toList) {
    // Fetch rows matching this email (returns an array)
    const rows = await db
      .select()
      .from(unsubscribes)
      .where(eq(unsubscribes.email, recipient));

    // 3) Take the first element (or undefined if none)
    const unsubRow = rows.length > 0 ? rows[0] : undefined;

    // If a row exists and unsubscribedAt is non-null, skip sending.
    if (unsubRow && unsubRow.unsubscribedAt !== null) {
      results.push({
        email: recipient,
        success: false,
        error: 'Recipient has unsubscribed',
      });
      continue;
    }

    // Generate or reuse the token
    let token: string;
    if (unsubRow) {
      // reuse existing unsubscribeToken
      token = unsubRow.unsubscribeToken;
    } else {
      // create a new row with a fresh token
      token = randomBytes(32).toString('hex'); // 64-char hex
      await db
        .insert(unsubscribes)
        .values({
          email: recipient,
          unsubscribeToken: token,
          unsubscribedAt: null,
        })
        .returning(); // return value not used
    }

    // Build the unsubscribe link
    const unsubscribeLink = `https://d1notes.com/api/unsubscribe?email=${encodeURIComponent(
      recipient,
    )}&token=${token}`;

    // Inject {{content}} and {{unsubscribe_link}} into BASE_TEMPLATE
    let fullHtml = BASE_TEMPLATE.replace('{{content}}', html || text || '');
    fullHtml = fullHtml.replace('{{unsubscribe_link}}', unsubscribeLink);

    // Prepare SES params: one ToAddress at a time
    const params = {
      Source: 'info@d1notes.com',
      Destination: {
        ToAddresses: [recipient],
        ...(cc ? { CcAddresses: Array.isArray(cc) ? cc : [cc] } : {}),
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: fullHtml },
          ...(text ? { Text: { Data: text } } : {}),
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      const info = await ses.send(command);
      results.push({ email: recipient, success: true, info });
    } catch (error) {
      console.error(`Error sending to ${recipient}:`, error);
      results.push({ email: recipient, success: false, error });
    }
  }

  return results;
}
