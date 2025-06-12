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
    const { url } = req.body;

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

    const prompt = `Identify and analyze up to 5 competitors of the follwing company using its URL, focusing on how these competitors leverage AI for business improvements, and provide recommendations.

Company URL: ${url}

✅ Steps


Identify Competitors:





Analyze the industry and business model of the company using its website URL.



Determine up to 5 direct or indirect competitors, ensuring they are not subsidiaries or partners.



Analyze Competitors' Use of AI:





Research how each competitor employs AI to drive revenue, cut costs, or streamline operations.



Collect relevant information and evidence to support each finding.



Formulate Recommendations:





Develop concrete and tailored recommendations for the requester based on the analysis of competitors.



Compile Results:





Present findings using a clean, structured format.



🔄 Output Format (HTML)
⚠️ Output the response as raw HTML only. Do **not** include any <html>, <head>, or <body> tags. Wrap the entire content inside a single <div> element.
The <div> background color should be white always.
✅ Use Tailwind CSS utility classes for styling headings, paragraphs, lists, and other elements. 
Ensure the HTML structure is clean, semantic, and visually appealing using Tailwind conventions.
There will be proper spacing between html elements for better readability.

## Competitor Analysis for [Company Name]

### 1. [Competitor Name]
- Website: [https://competitor-url.com](https://competitor-url.com)
- Why Included: Leverages AI to optimize supply chain efficiency.
- AI Use Cases:
  - Example 1
  - Example 2
- Recommendation:
  - Tailored recommendation based on this competitor’s use of AI.

### 2. [Competitor Name]
- Website: [https://competitor-url.com](https://competitor-url.com)
- Why Included: Leverages AI to optimize supply chain efficiency.
- AI Use Cases:
  - Example 1
  - Example 2
- Recommendation:
  - Tailored recommendation based on this competitor’s use of AI.

...

(Repeat for up to 5 competitors)




📝 Notes



Ensure the reason for competitor inclusion is clear, concise, and under 120 characters.



Focus on tangible business benefits of AI use (revenue growth, cost savings, operational efficiency).



Exclude subsidiaries or official partners from the competitor list.



Recommendations should be actionable and specific to the requester's company.

Don't include Notes in the end of the response.`;

    messages.push({ role: "user", content: [{ type: "text", text: prompt }] });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
    });

    const aiResponse = completion?.choices[0]?.message;
    messages.push({
      role: aiResponse.role,
      content: aiResponse.content,
    });
    const cleanResponse = cleanHtmlResponse(aiResponse.content);
    // Create lead record
    const lead = new Lead({
      companyUrl: url,
      messages: messages,
      snapshotData: cleanResponse,
    });

    await lead.save();

    res.json({
      success: true,
      data: cleanResponse,
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
