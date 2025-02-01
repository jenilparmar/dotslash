// /app/api/endlist/route.js
export async function POST(req) {
    try {
      // Parse the request body
      const data = await req.json();
      
      // Your business logic (e.g., storing data, processing, etc.)
      console.log("Received data:", data);
  
      // Respond with a success message
      return new Response(JSON.stringify({ success: true, message: "Data received successfully!" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
  