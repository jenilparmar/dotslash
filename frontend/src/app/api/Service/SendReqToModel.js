export async function sendReqToModel(paragraph) {
  const data = {
    paragraph: paragraph,
  };

  try {
    const response = await fetch("http://172.16.44.183:5000/getIntent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    const ResponseFromModel = [
      result.intent,
      result["DB_info"].split(/[\s,]+/)[0],
      result["DB_info"].split(/[\s,]+/)[1],
    ];

    return ResponseFromModel;
  } catch (error) {
    console.error("Error in sendReqToModel:", error);
    throw error; // Rethrow error to be handled by the calling code
  }
}
