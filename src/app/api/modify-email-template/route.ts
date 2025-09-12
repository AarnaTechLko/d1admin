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