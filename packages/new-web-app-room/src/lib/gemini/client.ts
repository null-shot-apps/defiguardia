import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Vulnerability types that DeFiGuard AI can detect
export interface Vulnerability {
  id: string;
  type: 'reentrancy' | 'overflow' | 'underflow' | 'access_control' | 'timestamp_dependence' | 'unchecked_call' | 'denial_of_service' | 'front_running' | 'price_manipulation' | 'flash_loan_attack';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  location: {
    line: number;
    column?: number;
    function?: string;
  };
  recommendation: string;
  codeSnippet: string;
  confidence: number; // 0-100
}

export interface AuditResult {
  contractAddress?: string;
  contractName?: string;
  vulnerabilities: Vulnerability[];
  riskScore: number; // 0-100
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  gasOptimizations: string[];
  bestPractices: string[];
  timestamp: string;
}

// Smart contract analysis prompt for Gemini
const ANALYSIS_PROMPT = `
You are DeFiGuard AI, an expert smart contract security auditor. Analyze the provided Solidity code for vulnerabilities, security issues, and best practices.

Focus on detecting these vulnerability types:
1. Reentrancy attacks
2. Integer overflow/underflow
3. Access control issues
4. Timestamp dependence
5. Unchecked external calls
6. Denial of service vulnerabilities
7. Front-running attacks
8. Price manipulation vulnerabilities
9. Flash loan attack vectors
10. Gas optimization issues

For each vulnerability found, provide:
- Vulnerability type and severity (critical/high/medium/low/info)
- Exact location (line number, function name)
- Clear description of the issue
- Specific recommendation to fix
- Code snippet showing the problematic code
- Confidence level (0-100)

Calculate an overall risk score (0-100) based on:
- Number and severity of vulnerabilities
- Code complexity
- External dependencies
- Access control patterns

Respond ONLY with valid JSON in this exact format:
{
  "vulnerabilities": [
    {
      "id": "unique_id",
      "type": "vulnerability_type",
      "severity": "severity_level",
      "title": "Brief title",
      "description": "Detailed description",
      "location": {
        "line": 0,
        "function": "function_name"
      },
      "recommendation": "How to fix",
      "codeSnippet": "problematic code",
      "confidence": 85
    }
  ],
  "riskScore": 75,
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 1,
    "info": 0
  },
  "gasOptimizations": ["optimization suggestions"],
  "bestPractices": ["best practice recommendations"]
}
`;

export async function analyzeContractWithGemini(
  solidityCode: string,
  contractName?: string,
  contractAddress?: string
): Promise<AuditResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `${ANALYSIS_PROMPT}

Contract Name: ${contractName || "Unknown"}
Contract Address: ${contractAddress || "Not deployed"}

Solidity Code to Analyze:
\`\`\`solidity
${solidityCode}
\`\`\`

Analyze this code and respond with JSON only.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini AI");
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Add metadata
    return {
      contractAddress,
      contractName,
      ...analysisResult,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error("Error analyzing contract with Gemini:", error);
    
    // Return fallback result
    return {
      contractAddress,
      contractName,
      vulnerabilities: [],
      riskScore: 0,
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
      gasOptimizations: [],
      bestPractices: [],
      timestamp: new Date().toISOString(),
    };
  }
}

// Quick vulnerability check for real-time analysis
export async function quickVulnerabilityCheck(codeSnippet: string): Promise<{
  hasVulnerabilities: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  quickFixes: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `
    Quickly analyze this Solidity code snippet for immediate security concerns:
    
    \`\`\`solidity
    ${codeSnippet}
    \`\`\`
    
    Respond with JSON only:
    {
      "hasVulnerabilities": boolean,
      "riskLevel": "low|medium|high|critical",
      "quickFixes": ["fix1", "fix2"]
    }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }
    
    return JSON.parse(jsonMatch[0]);
    
  } catch (error) {
    console.error("Error in quick vulnerability check:", error);
    return {
      hasVulnerabilities: false,
      riskLevel: 'low',
      quickFixes: [],
    };
  }
}
