import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages, title = "Chat History" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required." },
        { status: 400 }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #004AAD;
              border-bottom: 2px solid #004AAD;
              padding-bottom: 10px;
            }
            .message {
              margin: 20px 0;
              padding: 15px;
              border-radius: 8px;
            }
            .user-message {
              background-color: #f0f0f0;
              border-left: 4px solid #004AAD;
            }
            .assistant-message {
              background-color: #e8f4f8;
              border-left: 4px solid #00a8e8;
            }
            .role {
              font-weight: bold;
              margin-bottom: 8px;
              color: #004AAD;
            }
            .timestamp {
              font-size: 12px;
              color: #666;
              margin-top: 8px;
            }
            .content {
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${messages.map(msg => `
            <div class="message ${msg.role}-message">
              <div class="role">${msg.role === 'user' ? 'User' : 'Assistant'}</div>
              <div class="content">${msg.content}</div>
              ${msg.timestamp ? `<div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // Return HTML content that can be converted to PDF on the client side
    return NextResponse.json({ 
      html: htmlContent,
      title
    });

  } catch (error) {
    console.error("Download PDF API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF." },
      { status: 500 }
    );
  }
}

