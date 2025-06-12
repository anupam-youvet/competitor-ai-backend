const express = require("express");
const { OpenAI } = require("openai");
const router = express.Router();
const Lead = require("../models/lead");
const ContactUs = require("../models/contactUs");
const { cleanHtmlResponse, sendMail } = require("../utils/utils");
require("dotenv").config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });
// Quick snapshot endpoint
router.post("/snapshot", async (req, res) => {
  try {
    const { url, email } = req.body;

    // Check for existing recent request
    const existingLead = await Lead.findOne({
      companyUrl: url,
    });

    if (existingLead) {
      return res.json({
        success: true,
        data: existingLead.snapshotData,
      });
    }

    const messages = [];

    const prompt = `Identify and analyze up to 5 competitors of the following company using its URL, focusing on how these competitors leverage AI for business improvements, and provide tailored recommendations.

Company URL: ${url}

✅ Steps

1. **Identify Competitors**
   - Analyze the industry and business model of the company using its website URL.
   - Determine up to 5 direct or indirect competitors (excluding subsidiaries or official partners).

2. **Analyze Competitors' Use of AI**
   - Research how each competitor employs AI to drive revenue, reduce costs, or improve operations.
   - Include relevant evidence or examples.

3. **Formulate Recommendations**
   - Develop clear, tailored recommendations for the original company based on the competitive insights.

🔄 Output Format (JSON Only)

Return your response as **valid JSON**, using the following structure:
{
  "companyName": "Name of the company",
  "companyUrl": "${url}",
  "competitors": [
    {
      "name": "Competitor 1 Name",
      "website": "https://competitor1-url.com",
      "reasonForInclusion": "Brief reason why this is a competitor (max 120 characters)",
      "aiUseCases": [
        "Short, specific example of AI use #1",
        "Short, specific example of AI use #2"
      ],
      "recommendation": "Tailored recommendation based on this competitor’s use of AI"
    },
    {
      "name": "Competitor 2 Name",
      "website": "https://competitor2-url.com",
      "reasonForInclusion": "Brief reason why this is a competitor (max 120 characters)",
      "aiUseCases": [
        "Short, specific example of AI use #1",
        "Short, specific example of AI use #2"
      ],
      "recommendation": "Tailored recommendation based on this competitor’s use of AI"
    }
    // up to 5 competitors
  ]
}
📝 Notes:

* Ensure the "reasonForInclusion" is concise and clear (under 120 characters).
* Focus on business benefits of AI use: **revenue growth**, **cost savings**, **efficiency**.
* Do **not** include subsidiaries or partners as competitors.`;

    messages.push({ role: "user", content: [{ type: "text", text: prompt }] });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: {
        type: "json_object",
      },
    });

    const aiResponse = completion?.choices[0]?.message;
    messages.push({
      role: aiResponse.role,
      content: aiResponse.content,
    });
    // const cleanResponse = cleanHtmlResponse(aiResponse.content);
    // Create lead record
    const lead = new Lead({
      companyUrl: url,
      email: email,
      messages: messages,
      snapshotData: aiResponse?.content,
    });

    await lead.save();

    res.json({
      success: true,
      data: aiResponse?.content,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Deep report endpoint
router.post("/deep-report", async (req, res) => {
  try {
    const { email, phone, url } = req.body;
    // Check for existing recent request
    const existingLead = await Lead.findOne({
      companyUrl: url,
    });

    res.json({
      success: true,
      message:
        "Deep report being generated. You'll receive it via WhatsApp within 90 seconds.",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Consultancy contact form
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, saasSpend, goals } = req.body;

    const contactExists = await ContactUs.findOne({ email: email });

    if (contactExists) {
      res.json({
        success: true,
        message: "Contact details already exists.",
      });
    }

    const contact = new ContactUs({
      email,
      phone,
      goals,
      name,
      saasSpend,
    });

    await contact.save();
    res.json({ success: true, message: "Contact form submitted successfully" });
  } catch (error) {
    console.log("error in contact form submission: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
