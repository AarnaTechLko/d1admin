// email-service.ts - Server-side only email functionality
import { SESv2Client, SendBulkEmailCommand, SendBulkEmailCommandInput, CreateEmailTemplateCommand, DeleteEmailTemplateCommand } from '@aws-sdk/client-sesv2';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { unsubscribes } from './schema';
import { inArray } from 'drizzle-orm';
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

const ses = new SESv2Client({ region: process.env.AWS_REGION || 'us-east-2' });

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<
  { email: string; success: boolean; info?: any; error?: any }[]
> {
    const toList = Array.isArray(to) ? [...to] : [to];

    const results: {
        email: string;
        success: boolean;
        info?: any;
        error?: any;
    }[] = [];

    //   for (const recipient of toList) {
    // Fetch rows matching this email (returns an array)
    const rows = await db
        .select()
        .from(unsubscribes)
        .where(inArray(unsubscribes.email, toList));

    // 3) Take the first element (or undefined if none)
    const unsubRow = rows.length > 0 ? rows[0] : undefined;


    // Inject {{content}} and {{unsubscribe_link}} into BASE_TEMPLATE
    // let fullHtml = BASE_TEMPLATE.replace('{{content}}', html || text || '');

    for (const recipient of toList){
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

        // // Build the unsubscribe link
        // const unsubscribeLink = `https://d1notes.com/api/unsubscribe?email=${encodeURIComponent(
        // recipient,
        // )}&token=${token}`;

        // fullHtml = fullHtml.replace('{{unsubscribe_link}}', unsubscribeLink);
    }

    // Prepare SES params: one ToAddress at a time
    const params: SendBulkEmailCommandInput = {
        FromEmailAddress: 'info@d1notes.com',
        DefaultContent: {

            Template: {
                TemplateName: "Dynamic_Email_Template",
                TemplateData: JSON.stringify({
                    content: text,
                    subject: subject,
                })
            }
        },

      BulkEmailEntries: toList.map((email: string) => ({
        Destination:{ ToAddresses: [email] },
        // ...(cc ? { CcAddresses: Array.isArray(cc) ? cc : [cc] } : {}),
      })),
    };

    try {



        // const templateParams = {
        //     TemplateName: "Dynamic_Email_Template", // unique template name
        //     TemplateContent: {
        //     Subject: "{{subject}}",
        //     Html: BASE_TEMPLATE,
        //     }
        // };

        // const commands = new CreateEmailTemplateCommand(templateParams);
        // const result = await ses.send(commands);
        // console.log("Template created successfully:", result);
  
        // const input = { // DeleteTemplateRequest
        // TemplateName: "Multi-Emailss_Template", // required
        // };
        // const commandss = new DeleteEmailTemplateCommand(input);
        // const response = await ses.send(commandss);


        const command = new SendBulkEmailCommand(params);
        const info = await ses.send(command);

        console.log("Info: ", info);


        for (const recipient of toList){
            results.push({ email: recipient, success: true, info });
        }
        console.log("Finished");

    } catch (error) {
        console.error(`Error bulk emails:`, error);
        for (const recipient of toList){
            results.push({ email: recipient, success: false, error });
        }
    }
//   }

  return results;
}


