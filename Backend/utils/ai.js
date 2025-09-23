import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeTicket = async (ticket) => {
  const supportAgent = createAgent({
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    name: "AI Ticket Triage Assistant",
    system: `You are an expert AI assistant that processes tickets. Respond ONLY in JSON.`,
  });

  const response = await supportAgent.run(`
Analyze the ticket and return ONLY a JSON object with:
{
  "summary": "short summary",
  "priority": "low|medium|high",
  "helpfulNotes": "technical notes",
  "relatedSkills": ["skills"]
}

Title: ${ticket.title}
Description: ${ticket.description}
`);
// console.log(response)
  // Extract text from response
  const raw = response.output?.[0]?.content || "";
  if (!raw) {
    console.log("Failed to parse JSON from AI response: AI returned empty response");
    return null;
  }

  // Remove markdown if present
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  const jsonString = match ? match[1] : raw.trim();

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.log("Failed to parse JSON from AI response: " + e.message);
    return null;
  }
};

export default analyzeTicket;

