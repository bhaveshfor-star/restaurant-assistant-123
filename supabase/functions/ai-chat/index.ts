import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface IssueItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  symptoms: string[];
  solutions: string[];
}

interface KnowledgeItem extends IssueItem {}

// Advanced text processing
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(t => t.length > 1);
}

function getNgrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}

// TF-IDF inspired term weighting
function computeTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

// Synonym and related term mapping for restaurant POS domain
const SYNONYMS: Record<string, string[]> = {
  "printer": ["thermal printer", "receipt printer", "bill printer", "kot printer", "print"],
  "kot": ["kitchen order ticket", "kitchen printer", "printer"],
  "payment": ["transaction", "payment gateway", "card", "upi", "billing"],
  "crash": ["crashed", "freeze", "frozen", "hang", "stuck", "not responding"],
  "login": ["signin", "sign in", "log in", "authentication", "credential"],
  "inventory": ["stock", "inventory", "product", "items", "quantity"],
  "order": ["orders", "transaction", "billing", "kot"],
  "slow": ["laggy", "slow performance", "delay", "lag", "unresponsive"],
  "sync": ["synchronize", "syncing", "synchronization", "update", "refresh"],
  "online": ["delivery", "swiggy", "zomato", "aggregator", "foodpanda"],
  "refund": ["return", "refund", "money back", "cancel payment"],
  "receipt": ["bill", "invoice", "printout", "kot", "receipt printer"],
  "not working": ["not responding", "stuck", "offline", "down", "broken", "failed"],
  "not printing": ["no print", "printer not working", "print failed", "blank"],
  "error": ["error message", "failed", "issue", "problem", "fault"],
  "database": ["db", "database server", "sql", "mongodb", "mysql"],
  "wifi": ["network", "internet", "connection", "lan", "wireless"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "printer": ["printer", "print", "kot", "receipt", "thermal", "paper", "bill print"],
  "payment": ["payment", "transaction", "card", "upi", "gateway", "refund", "qr", "pay"],
  "integration": ["swiggy", "zomato", "online", "delivery", "aggregator", "api", "sync"],
  "software": ["crash", "freeze", "update", "install", "stuck", "white screen", "update failed"],
  "inventory": ["stock", "inventory", "quantity", "item", "product", "negative", "stock count"],
  "authentication": ["login", "password", "credential", "user", "role", "permission", "admin", "access"],
  "network": ["wifi", "internet", "connection", "lan", "offline", "cloud", "network"],
  "database": ["database", "db", "backup", "data", "record", "connection failed"],
  "analytics": ["report", "analytics", "revenue", "profit", "sales", "dashboard"],
  "performance": ["slow", "lag", "cpu", "ram", "performance", "speed"],
  "chatbot": ["chatbot", "ai", "bot", "nlp", "response"],
  "billing": ["bill", "tax", "discount", "coupon", "gst", "billing"],
  "hardware": ["scanner", "barcode", "touchscreen", "kds", "display"],
};

const PHRASE_INTENTS: Array<{ patterns: RegExp[]; category: string; boost: number }> = [
  { patterns: [/kot.*not.*print/i, /printer.*not.*work/i, /bill.*not.*print/i], category: "printer", boost: 4 },
  { patterns: [/payment.*fail/i, /transaction.*fail/i, /card.*decline/i, /upi.*fail/i], category: "payment", boost: 4 },
  { patterns: [/swiggy|zomato/i, /online.*order.*not/i, /delivery.*sync/i], category: "integration", boost: 4 },
  { patterns: [/pos.*crash/i, /app.*freeze/i, /software.*crash/i], category: "software", boost: 4 },
  { patterns: [/inventory.*not.*update/i, /stock.*not/i, /negative.*stock/i], category: "inventory", boost: 4 },
  { patterns: [/cannot.*log/i, /login.*fail/i, /password.*incorrect/i], category: "authentication", boost: 4 },
  { patterns: [/wifi.*disconnect/i, /internet.*not/i, /network.*down/i], category: "network", boost: 4 },
  { patterns: [/slow.*performance/i, /pos.*slow/i, /lag/i, /cpu.*high/i], category: "performance", boost: 4 },
];

function expandQuery(tokens: string[]): string[] {
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const key = token.toLowerCase();
    if (SYNONYMS[key]) {
      for (const syn of SYNONYMS[key]) {
        expanded.add(syn.toLowerCase());
      }
    }
  }
  return Array.from(expanded);
}

function computeCosineSimilarity(queryTokens: string[], docTokens: string[]): number {
  const queryTF = computeTermFrequency(queryTokens);
  const docTF = computeTermFrequency(docTokens);

  const allTerms = new Set([...queryTF.keys(), ...docTF.keys()]);
  let dotProduct = 0;
  for (const term of allTerms) {
    dotProduct += (queryTF.get(term) || 0) * (docTF.get(term) || 0);
  }

  const queryNorm = Math.sqrt(Array.from(queryTF.values()).reduce((s, v) => s + v * v, 0));
  const docNorm = Math.sqrt(Array.from(docTF.values()).reduce((s, v) => s + v * v, 0));

  return (queryNorm > 0 && docNorm > 0) ? dotProduct / (queryNorm * docNorm) : 0;
}

function computeJaccardSimilarity(queryTokens: string[], docTokens: string[]): number {
  const querySet = new Set(queryTokens);
  const docSet = new Set(docTokens);
  const intersection = new Set([...querySet].filter(x => docSet.has(x)));
  const union = new Set([...querySet, ...docSet]);
  return intersection.size / Math.max(union.size, 1);
}

function computeNgramSimilarity(query: string, doc: string, n: number = 2): number {
  const queryNgrams = new Set(getNgrams(tokenize(query), n));
  const docNgrams = new Set(getNgrams(tokenize(doc), n));
  const intersection = new Set([...queryNgrams].filter(x => docNgrams.has(x)));
  return intersection.size / Math.max(Math.min(queryNgrams.size, docNgrams.size), 1);
}

function detectCategory(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  // Check phrase intents first
  for (const intent of PHRASE_INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(lowerQuery)) {
        return intent.category;
      }
    }
  }

  // Check category keywords
  const queryTokens = tokenize(query);
  const categoryScores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) categoryScores[category] = score;
  }

  const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);
  return sortedCategories.length > 0 ? sortedCategories[0][0] : null;
}

function computeScore(
  query: string,
  issue: IssueItem,
  detectedCategory: string | null
): number {
  const queryTokens = tokenize(query);
  const expandedQueryTokens = expandQuery(queryTokens);
  const titleTokens = tokenize(issue.title);
  const descTokens = tokenize(issue.description);
  const symptomsTokens = issue.symptoms.flatMap(s => tokenize(s));

  let score = 0;

  // Title match (most important)
  const titleCosSim = computeCosineSimilarity(expandedQueryTokens, titleTokens);
  const titleJaccard = computeJaccardSimilarity(queryTokens, titleTokens);
  const titleNgram = computeNgramSimilarity(query, issue.title);
  score += (titleCosSim * 4 + titleJaccard * 3 + titleNgram * 2) * 4;

  // Exact word matches in title (bonus)
  const lowerTitle = issue.title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  for (const token of queryTokens) {
    if (lowerTitle.includes(token)) score += 2;
    if (lowerTitle.includes(normalizeText(token))) score += 1.5;
  }

  // Description match
  const descCosSim = computeCosineSimilarity(expandedQueryTokens, descTokens);
  score += descCosSim * 2;

  // Symptoms match
  const symptomsCosSim = computeCosineSimilarity(expandedQueryTokens, symptomsTokens);
  score += symptomsCosSim * 3;

  // Category match bonus
  if (detectedCategory && issue.category === detectedCategory) {
    score += 8;
  }

  // Keyword matching
  for (const keyword of CATEGORY_KEYWORDS[issue.category] || []) {
    if (lowerQuery.includes(keyword)) {
      score += 1.5;
    }
  }

  // Phrase intent boost
  for (const intent of PHRASE_INTENTS) {
    if (intent.category === issue.category) {
      for (const pattern of intent.patterns) {
        if (pattern.test(lowerQuery)) {
          score += intent.boost;
        }
      }
    }
  }

  // Severity boost (critical issues should be prioritized)
  if (issue.severity === "critical" && score > 3) score += 1.5;
  if (issue.severity === "high" && score > 3) score += 0.5;

  return score;
}

function findBestMatches(
  query: string,
  issues: IssueItem[],
  topK = 3
): Array<{ item: IssueItem; score: number }> {
  const detectedCategory = detectCategory(query);

  const results: Array<{ item: IssueItem; score: number }> = [];

  for (const issue of issues) {
    const score = computeScore(query, issue, detectedCategory);
    if (score > 1.5) {
      results.push({ item: issue, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // If no good matches, try a broader search
  if (results.length === 0) {
    for (const issue of issues) {
      const score = computeScore(query, issue, detectedCategory) * 0.5;
      if (score > 0.5) {
        results.push({ item: issue, score });
      }
    }
    results.sort((a, b) => b.score - a.score);
  }

  return results.slice(0, topK);
}

function generateResponse(
  query: string,
  matches: Array<{ item: IssueItem; score: number }>,
  history: ChatMessage[]
): string {
  const lq = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good\s*(morning|evening|afternoon)|howdy)/i.test(lq)) {
    return "Hello! I'm your Restaurant POS AI Assistant. I can help you troubleshoot issues with:\n\n**Hardware** - KOT printers, barcode scanners, touchscreen\n**Payments** - Gateway failures, refunds, QR issues\n**Software** - Crashes, slow performance, updates\n**Integration** - Swiggy, Zomato, online orders\n**Operations** - Inventory, billing, analytics\n\nWhat issue are you experiencing?";
  }

  // Thanks
  if (/\b(thank|thanks|thank you|great|perfect|awesome|helpful)\b/i.test(lq)) {
    return "You're welcome! I'm here whenever you need help with your restaurant POS. Feel free to ask about any issues.";
  }

  // Capabilities
  if (/\b(help|what can you do|capabilities|features|support)\b/i.test(lq)) {
    return `I can assist with 50+ restaurant POS troubleshooting scenarios:\n\n**Printer Issues:**\n• KOT not printing, bill delays, random symbols\n\n**Payment Problems:**\n• Transaction failures, refund issues, QR scanning\n\n**Software Issues:**\n• Crashes, slow performance, update failures\n\n**Online Orders:**\n• Swiggy/Zomato sync, delivery status\n\n**Hardware:**\n• Barcode scanner, touchscreen, KDS display\n\n**Operations:**\n• Inventory sync, billing, reports, database backup\n\nDescribe your problem and I'll provide step-by-step solutions!`;
  }

  // Profit improvement
  if (/\b(profit|revenue|sales|earnings|improve|grow|increase)\b/i.test(lq)) {
    const profitMatch = matches.find(m => m.item.title.toLowerCase().includes("profit"));
    if (profitMatch) {
      return `**${profitMatch.item.title}**\n\nHere's how to optimize your restaurant performance:\n\n${profitMatch.item.solutions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nCheck the Analytics Dashboard for detailed insights on your best-selling items, peak hours, and revenue trends.`;
    }
  }

  // No match found
  if (matches.length === 0) {
    return `I couldn't find a specific solution for "${query}" in my knowledge base.\n\n**Try rephrasing your question, for example:**\n• "KOT printer not working"\n• "Payment transaction failed"\n• "POS is slow"\n• "Cannot login to POS"\n\nOr contact your technical support team for assistance. Would you like me to help with a different issue?`;
  }

  // Generate response from best match
  const best = matches[0];
  const issue = best.item;

  const severityLabels: Record<string, string> = {
    "critical": "CRITICAL",
    "high": "HIGH",
    "medium": "MEDIUM",
    "low": "LOW"
  };

  const severityColors: Record<string, string> = {
    "critical": "Immediate action required",
    "high": "Priority issue - resolve quickly",
    "medium": "Standard priority",
    "low": "Minor issue"
  };

  let response = `**${issue.title}**`;
  response += `\n*[${severityLabels[issue.severity]} PRIORITY - ${severityColors[issue.severity]}]*\n`;

  if (issue.symptoms.length > 0) {
    response += `\n\n**Common Symptoms:**`;
    issue.symptoms.forEach(s => { response += `\n• ${s}`; });
  }

  if (issue.solutions.length > 0) {
    response += `\n\n**Step-by-Step Solution:**`;
    issue.solutions.forEach((s, i) => { response += `\n${i + 1}. ${s}`; });
  }

  if (issue.severity === "critical" || issue.severity === "high") {
    response += `\n\n⚠️ *This is a ${issue.severity.toUpperCase()} severity issue. If these steps don't resolve it, contact technical support immediately.*`;
  }

  response += `\n\nDid this solve your issue? If not, I can provide more details or suggest escalation.`;

  return response;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { message, history = [], session_id } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all issues from database
    const { data: issuesData, error: issuesError } = await supabase
      .from("restaurant_issues")
      .select("*")
      .eq("is_active", true);

    if (issuesError) {
      console.error("Database error:", issuesError);
    }

    const issues: IssueItem[] = (issuesData || []).map((i: Record<string, unknown>) => ({
      id: i.id as string,
      title: i.title as string,
      description: i.description as string,
      category: i.category as string,
      severity: i.severity as string,
      symptoms: (i.symptoms || []) as string[],
      solutions: (i.solutions || []) as string[],
    }));

    // Find best matches with semantic similarity
    const matches = findBestMatches(message, issues);
    const responseText = generateResponse(message, matches, history);

    // Save messages if session_id provided
    if (session_id) {
      const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
      if (authHeader) {
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          await supabase.from("chat_messages").insert([
            { session_id, user_id: user.id, role: "user", content: message },
            { session_id, user_id: user.id, role: "assistant", content: responseText },
          ]);
          await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", session_id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        matches_found: matches.length,
        confidence: matches.length > 0 ? Math.min(matches[0].score / 10, 1).toFixed(2) : 0,
        category_detected: detectCategory(message),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
