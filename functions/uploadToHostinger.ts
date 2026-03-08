import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const uploadForm = new FormData();
    uploadForm.append('file', file);

    const res = await fetch('https://testes.contatoaline.com/upload.php', {
      method: 'POST',
      body: uploadForm,
    });

    const json = await res.json();
    if (json.error) return Response.json({ error: json.error }, { status: 500 });

    return Response.json({ file_url: json.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});