import { NextApiRequest, NextApiResponse } from "next";

const bufferToBase64 = (buffer: Buffer) => {
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Received request");
  //

  if (req.method.toLowerCase() !== "post") {
    return res.status(501).send("Wrong request method");
  }

  const input = JSON.parse(req.body).input;

  // Add fetch request to Hugging Face
  const response = await fetch(
    `https://api-inference.huggingface.co/models/waptik/sd-waptik`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: input,
      }),
    }
  );

  // Check for different statuses to send proper payload
  if (response.ok) {
    const buffer = await (response as any).buffer();
    // Convert to base64
    const base64 = bufferToBase64(buffer);
    // Make sure to change to base64
    res.status(200).json({ image: base64 });
  } else if (response.status === 503) {
    const json = await response.json();
    res.status(503).json(json);
  } else {
    const data = await response.json();
    res.status(response.status).json({ data, error: response.statusText });
  }
}

export default handler;
