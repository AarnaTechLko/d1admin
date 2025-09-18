import { CreateEmailTemplateCommand, DeleteEmailTemplateCommand, SESv2Client, SendBulkEmailCommand, SendBulkEmailCommandInput, SendBulkEmailCommandOutput, SendEmailCommand, SendEmailCommandOutput } from '@aws-sdk/client-sesv2';
import { db } from '@/lib/db';
import { unsubscribes } from './schema';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { BASE_TEMPLATE } from './templates/email-templates';
// import axios from 'axios';
import { randomBytes } from 'crypto';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
}

interface SendEmailWithAttachmentsParams {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: string[]; // CloudFront URLs
}

// Add missing interfaces
// interface AttachmentData {
//   filename: string;
//   content: string;
//   contentType: string;
// }

interface RawMessageParams {
  to: string;
  subject: string;
  html: string;
  // attachments: AttachmentData[];
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

  console.log("Emails: ", validEmails);

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

// export async function sendEmailWithAttachments({
//   to,
//   subject,
//   html,
//   attachments = []
// }: SendEmailWithAttachmentsParams) {
//   const toList = Array.isArray(to) ? [...to] : [to];
//   const results = [];

//   // Same unsubscribe check as your current function
//   const unsubscribedRows = await db
//     .select({ email: unsubscribes.email })
//     .from(unsubscribes)
//     .where(and(
//       inArray(unsubscribes.email, toList),
//       isNotNull(unsubscribes.unsubscribedAt)
//     ));
  
//   const unsubscribedEmails = new Set(unsubscribedRows.map(row => row.email));
//   const validEmails = toList.filter(email => {
//     if (unsubscribedEmails.has(email)) {
//       results.push({ email, success: false, error: 'Recipient has unsubscribed' });
//       return false;
//     }
//     return true;
//   });

//   // Download attachments
//   const attachmentData = await Promise.all(
//     attachments.map(async (url) => {
//       const response = await axios.get(url, { responseType: 'arraybuffer' });
//       return {
//         filename: url.split('/').pop() || 'attachment',
//         content: Buffer.from(response.data).toString('base64'),
//         contentType: response.headers['content-type'] || 'application/octet-stream'
//       };
//     })
//   );

//   // Send individual emails with attachments
//   for (const email of validEmails) {
//     // Merge content into BASE_TEMPLATE
//     // const finalHtml = BASE_TEMPLATE.replace('{{content}}', html);
//     let token: string;
// const existingUnsubscribe = await db
//   .select({ unsubscribeToken: unsubscribes.unsubscribeToken })
//   .from(unsubscribes)
//   .where(eq(unsubscribes.email, email))
//   .limit(1);

// if (existingUnsubscribe.length > 0) {
//   token = existingUnsubscribe[0].unsubscribeToken;
// } else {
//   token = randomBytes(32).toString('hex');
//   await db.insert(unsubscribes).values({
//     email: email,
//     unsubscribeToken: token,
//     unsubscribedAt: null,
//   });
// }

// const unsubscribeLink = `https://d1notes.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

// const finalHtml = BASE_TEMPLATE
//   .replace('{{content}}', html)
//   .replace('{{unsubscribe_link}}', unsubscribeLink);

//     const rawMessage = createRawMessage({ 
//       to: email, 
//       subject, 
//       html: finalHtml, 
//       attachments: attachmentData 
//     });

//     try {
//       const command = new SendEmailCommand({
//         FromEmailAddress: 'info@d1notes.com',
//         Destination: { ToAddresses: [email] },
//         Content: {
//       Raw: {
//         Data: rawMessage
//       }
//     }
//       });
      
//       const info = await ses.send(command);
//       results.push({ email, success: true, info });
//     } catch (error) {
//       results.push({ email, success: false, error });
//     }
//   }

//   return results;
// }

export async function sendEmailWithAttachments({
  to,
  subject,
  html,
  // attachments = []
}: SendEmailWithAttachmentsParams) {
  const toList = Array.isArray(to) ? [...to] : [to];
const results: { 
  email: string; 
  success: boolean; 
  info?: SendEmailCommandOutput; 
  error?: Error | string | unknown 
}[] = [];

  // Unsubscribe check (existing code)
  const unsubscribedRows = await db
    .select({ email: unsubscribes.email })
    .from(unsubscribes)
    .where(and(
      inArray(unsubscribes.email, toList),
      isNotNull(unsubscribes.unsubscribedAt)
    ));
  
  const unsubscribedEmails = new Set(unsubscribedRows.map(row => row.email));
  const validEmails = toList.filter(email => {
    if (unsubscribedEmails.has(email)) {
      results.push({ email, success: false, error: 'Recipient has unsubscribed' });
      return false;
    }
    return true;
  });

  // Download attachments ONCE
  // const attachmentData = await Promise.all(
  //   attachments.map(async (url) => {
  //     try {
  //       const response = await axios.get(url, { responseType: 'arraybuffer' });
  //       return {
  //         filename: url.split('/').pop() || 'attachment',
  //         content: Buffer.from(response.data).toString('base64'),
  //         contentType: response.headers['content-type'] || 'application/octet-stream'
  //       };
  //     } catch (error) {
  //       throw new Error(`Failed to download attachment: ${error}`);
  //     }
  //   })
  // );

  // Process emails in batches of 10 with delay
  const batchSize = 10;
  for (let i = 0; i < validEmails.length; i += batchSize) {
    const batch = validEmails.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (email) => {
      // Generate unsubscribe token (existing code)
      let token: string;
      const existingUnsubscribe = await db
        .select({ unsubscribeToken: unsubscribes.unsubscribeToken })
        .from(unsubscribes)
        .where(eq(unsubscribes.email, email))
        .limit(1);

      if (existingUnsubscribe.length > 0) {
        token = existingUnsubscribe[0].unsubscribeToken;
      } else {
        token = randomBytes(32).toString('hex');
        await db.insert(unsubscribes).values({
          email: email,
          unsubscribeToken: token,
          unsubscribedAt: null,
        });
      }

      const unsubscribeLink = `https://d1notes.com/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
      const finalHtml = BASE_TEMPLATE
        .replace('{{content}}', html)
        .replace('{{unsubscribe_link}}', unsubscribeLink);

      const rawMessage = createRawMessage({ 
        to: email, 
        subject, 
        html: finalHtml, 
        // attachments: attachmentData 
      });

      try {
        const command = new SendEmailCommand({
          FromEmailAddress: 'info@d1notes.com',
          Destination: { ToAddresses: [email] },
          Content: { Raw: { Data: rawMessage } }
        });
        
        const info = await ses.send(command);
        results.push({ email, success: true, info });
      } catch (error) {
        results.push({ email, success: false, error });
      }
    }));

    // Add delay between batches to respect rate limits
    if (i + batchSize < validEmails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// function createRawMessage({ to, subject, html, attachments }: RawMessageParams): Buffer {

function createRawMessage({ to, subject, html }: RawMessageParams): Buffer {
  const boundary = `----=_Part_${Date.now()}`;
  
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    '',
    html,
    ''
  ];

  // attachments.forEach(att => {
  //   message.push(
  //     `--${boundary}`,
  //     `Content-Type: ${att.contentType}`,
  //     `Content-Disposition: attachment; filename="${att.filename}"`,
  //     `Content-Transfer-Encoding: base64`,
  //     '',
  //     att.content,
  //     ''
  //   );
  // });

  message.push(`--${boundary}--`);
  return Buffer.from(message.join('\r\n'));
}

export async function updateEmailTemplate() {
  const templateParams = {
    TemplateName: "Dynamic_Email_Template",
    TemplateContent: {
      Subject: "{{subject}}",
      Html: BASE_TEMPLATE,
    }
  };

  try {
    const command = new CreateEmailTemplateCommand(templateParams);
    const result = await ses.send(command);
    console.log("Template updated successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error };
  }
}

export async function deleteEmailTemplate(templateName: string = "Dynamic_Email_Template") {
  try {
    const command = new DeleteEmailTemplateCommand({
      TemplateName: templateName,
    });
    const result = await ses.send(command);
    console.log("Template deleted successfully:", result);
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, error };
  }
}

// Run the following fetch requests in your google chrome console to delete or update template the API:
// fetch('/api/email-template', {
//   method: 'PUT',
//   headers: { 'Content-Type': 'application/json' }
// })
// .then(res => res.json())
// .then(data => console.log('Update result:', data))
// .catch(err => console.error('Update error:', err));


// fetch('/api/email-template', {
//   method: 'DELETE',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ templateName: 'Dynamic_Email_Template' })
// })
// .then(res => res.json())
// .then(data => console.log('Delete result:', data))
// .catch(err => console.error('Delete error:', err));