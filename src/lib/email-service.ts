import { SESv2Client, SendBulkEmailCommand, SendBulkEmailCommandInput, SendBulkEmailCommandOutput } from '@aws-sdk/client-sesv2';
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
  { email: string; success: boolean; info?: SendBulkEmailCommandOutput; error?: Error | unknown }[]
> {
  const toList = Array.isArray(to) ? [...to] : [to];
  const results: { email: string; success: boolean; info?: SendBulkEmailCommandOutput; error?: Error | unknown }[] = [];

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

  const params: SendBulkEmailCommandInput = {
    FromEmailAddress: 'info@d1notes.com',
    DefaultContent: {
      Template: {
        TemplateName: "Dynamic_Email_Template",
        TemplateData: JSON.stringify({
          content: html || text,
          subject: subject,
        })
      }
    },
    BulkEmailEntries: validEmails.map((email: string) => ({
      Destination: { ToAddresses: [email] },
    })),
  };

  try {
    const command = new SendBulkEmailCommand(params);
    const info = await ses.send(command);

    for (const email of validEmails) {
      results.push({ email, success: true, info });
    }
  } catch (error) {
    for (const email of validEmails) {
      results.push({ email, success: false, error });
    }
  }

  return results;
}


