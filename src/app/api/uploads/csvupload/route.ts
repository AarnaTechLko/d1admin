import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import Papa from 'papaparse'; // CSV parsing library

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['text/csv'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          console.log('blob upload completed', blob.url, tokenPayload);

          // Fetch the uploaded CSV file from the blob URL
          const response = await fetch(blob.url);
          const csvData = await response.text();

          // Parse the CSV data to JSON
          const { data } = Papa.parse(csvData, { header: true, skipEmptyLines: true });

          // You can process the data here if needed, but don't return it from this function
          console.log('Parsed CSV data:', data);

        } catch (error) {
          console.error('Error processing the CSV file:', error);
          throw new Error('Error processing the CSV file: ' + (error as Error).message);
        }
      },
    });

    // Return the parsed CSV data as JSON from the main handler
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
