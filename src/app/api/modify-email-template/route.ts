import { updateEmailTemplate, deleteEmailTemplate } from '@/lib/bulkemail-service';

export async function POST(req: Request) {
  const { action, templateName } = await req.json();
  
  if (action === 'update') {
    const result = await updateEmailTemplate();
    return Response.json(result);
  }
  
  if (action === 'delete') {
    const result = await deleteEmailTemplate(templateName);
    return Response.json(result);
  }
  
  return Response.json({ success: false, error: 'Invalid action' });
}