import { SESv2Client, SendEmailCommand, SendEmailCommandOutput } from '@aws-sdk/client-sesv2';
import { db } from '@/lib/db';
import { unsubscribes } from './schema';
import { and, inArray, isNotNull } from 'drizzle-orm';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
}

const ses = new SESv2Client({ region: process.env.AWS_REGION || 'us-east-2' });

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<
  { email: string; success: boolean; info?: SendEmailCommandOutput; error?: Error | unknown }[]
> {
  const toList = Array.isArray(to) ? [...to] : [to];
  const results: { email: string; success: boolean; info?: SendEmailCommandOutput; error?: Error | unknown }[] = [];

  // Get unsubscribed emails
  const unsubscribedRows = await db
    .select({ email: unsubscribes.email })
    .from(unsubscribes)
    .where(and(
      inArray(unsubscribes.email, toList),
      isNotNull(unsubscribes.unsubscribedAt)
    ));
  
  const unsubscribedEmails = new Set(unsubscribedRows.map(row => row.email));

  // Filter out unsubscribed emails
  const validEmails = toList.filter(email => {
    if (unsubscribedEmails.has(email)) {
      results.push({ email, success: false, error: 'Recipient has unsubscribed' });
      return false;
    }
    return true;
  });

  if (validEmails.length === 0) {
    return results;
  }

  // Send individual emails
  for (const email of validEmails) {
    try {
      const command = new SendEmailCommand({
        FromEmailAddress: 'info@d1notes.com',
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: subject },
            Body: {
              Html: { Data: html },
              ...(text && { Text: { Data: text } })
            }
          }
        }
      });
      
      const info = await ses.send(command);
      results.push({ email, success: true, info });
    } catch (error) {
      results.push({ email, success: false, error });
    }
  }

  return results;
}
