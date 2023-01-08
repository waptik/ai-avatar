import { NextApiRequest, NextApiResponse } from "next";

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
    const buffer = await response.buffer();
    res.status(200).json({ image: buffer });
  } else if (response.status === 503) {
    const json = await response.json();
    res.status(503).json(json);
  } else {
    const data = await response.json();
    res.status(response.status).json({ data, error: response.statusText });
  }
}

export default handler;
