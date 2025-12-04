import { MCPServer, MCPMessage, MCPCapability, ContractAnalysisRequest, ContractAnalysisResponse, Vulnerability } from '@/lib/nullshot/types';

// SlitherMCP - Static Analysis Server for DeFiGuard AI
export class SlitherMCP extends MCPServer {
  name = 'SlitherMCP';
  version = '1.0.0';
  description = 'Static analysis server using Slither-inspired techniques for smart contract vulnerability detection';
  
  capabilities: MCPCapability[] = [
    {
      name: 'static_analysis',
      version: '1.0.0',
      description: 'Comprehensive static analysis of Solidity smart contracts',
      methods: ['analyze_contract', 'detect_vulnerabilities', 'check_patterns']
    }
  ];

  private analysisPatterns = {
    reentrancy: {
      pattern: /\.call\s*\{[^}]*\}\s*\([^)]*\)|\.call\s*\([^)]*\)/g,
      severity: 'critical' as const,
      description: 'Potential reentrancy vulnerability detected'
    },
    uncheckedCall: {
      pattern: /\.call\s*\([^)]*\)(?!\s*;?\s*require)/g,
      severity: 'high' as const,
      description: 'Unchecked external call detected'
    },
    accessControl: {
      pattern: /function\s+\w+\s*\([^)]*\)\s*(?:public|external)(?!\s+\w*(?:onlyOwner|onlyAdmin|require))/g,
      severity: 'medium' as const,
      description: 'Public/external function without access control'
    },
    timestampDependence: {
      pattern: /block\.timestamp|now\s*[<>=]/g,
      severity: 'medium' as const,
      description: 'Timestamp dependence detected'
    },
    integerOverflow: {
      pattern: /\+\+|\-\-|\+\s*=|\-\s*=|\*\s*=|\/\s*=/g,
      severity: 'high' as const,
      description: 'Potential integer overflow/underflow'
    }
  };

  async initialize(): Promise<void> {
    this.log('SlitherMCP initialized', 'info');
  }

  async handleRequest(message: MCPMessage): Promise<MCPMessage> {
    try {
      switch (message.method) {
        case 'analyze_contract':
          return await this.analyzeContract(message);
        case 'detect_vulnerabilities':
          return await this.detectVulnerabilities(message);
        case 'check_patterns':
          return await this.checkPatterns(message);
        default:
          return this.createError(message.id, 404, `Method ${message.method} not found`);
      }
    } catch (error) {
      return this.createError(message.id, 500, `Internal error: ${error}`);
    }
  }

  async shutdown(): Promise<void> {
    this.log('SlitherMCP shutting down', 'info');
  }

  private async analyzeContract(message: MCPMessage): Promise<MCPMessage> {
    const request: ContractAnalysisRequest = message.params;
    const startTime = Date.now();

    try {
      const vulnerabilities = await this.performStaticAnalysis(request.contractCode);
      const riskScore = this.calculateRiskScore(vulnerabilities);
      
      const response: ContractAnalysisResponse = {
        analysisId: `slither_${Date.now()}`,
        contractInfo: {
          name: request.contractName,
          address: request.contractAddress,
          chainId: request.chainId,
        },
        vulnerabilities,
        riskScore,
        gasAnalysis: {
          estimatedGas: 0, // Would be calculated by gas analyzer
          optimizations: [],
          inefficiencies: [],
          score: 80,
        },
        recommendations: this.generateRecommendations(vulnerabilities),
        timestamp: new Date().toISOString(),
        analysisTime: Date.now() - startTime,
      };

      return this.createResponse(message.id, response);
    } catch (error) {
      return this.createError(message.id, 500, `Analysis failed: ${error}`);
    }
  }

  private async detectVulnerabilities(message: MCPMessage): Promise<MCPMessage> {
    const { code } = message.params;
    const vulnerabilities = await this.performStaticAnalysis(code);
    return this.createResponse(message.id, { vulnerabilities });
  }

  private async checkPatterns(message: MCPMessage): Promise<MCPMessage> {
    const { code, patterns } = message.params;
    const results = {};
    
    for (const patternName of patterns) {
      if (this.analysisPatterns[patternName as keyof typeof this.analysisPatterns]) {
        results[patternName] = this.checkPattern(code, patternName);
      }
    }
    
    return this.createResponse(message.id, results);
  }

  private async performStaticAnalysis(code: string): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const lines = code.split('\n');

    // Check for reentrancy vulnerabilities
    const reentrancyMatches = code.match(this.analysisPatterns.reentrancy.pattern);
    if (reentrancyMatches) {
      vulnerabilities.push({
        id: `reentrancy_${Date.now()}`,
        type: 'reentrancy',
        severity: 'critical',
        title: 'Reentrancy Vulnerability',
        description: 'External call detected that could lead to reentrancy attacks',
        location: this.findLocation(code, reentrancyMatches[0]),
        impact: 'Attackers could drain contract funds through recursive calls',
        recommendation: 'Use the checks-effects-interactions pattern or reentrancy guards',
        codeSnippet: reentrancyMatches[0],
        confidence: 85,
        cwe: 'CWE-841',
        references: ['https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/']
      });
    }

    // Check for unchecked external calls
    const uncheckedCallMatches = code.match(this.analysisPatterns.uncheckedCall.pattern);
    if (uncheckedCallMatches) {
      vulnerabilities.push({
        id: `unchecked_call_${Date.now()}`,
        type: 'unchecked_call',
        severity: 'high',
        title: 'Unchecked External Call',
        description: 'External call without checking return value',
        location: this.findLocation(code, uncheckedCallMatches[0]),
        impact: 'Failed external calls may not be detected, leading to unexpected behavior',
        recommendation: 'Always check return values of external calls or use require statements',
        codeSnippet: uncheckedCallMatches[0],
        confidence: 90,
        cwe: 'CWE-252'
      });
    }

    // Check for access control issues
    const accessControlMatches = code.match(this.analysisPatterns.accessControl.pattern);
    if (accessControlMatches) {
      vulnerabilities.push({
        id: `access_control_${Date.now()}`,
        type: 'access_control',
        severity: 'medium',
        title: 'Missing Access Control',
        description: 'Public/external function without proper access control',
        location: this.findLocation(code, accessControlMatches[0]),
        impact: 'Unauthorized users may be able to call sensitive functions',
        recommendation: 'Add appropriate access control modifiers (onlyOwner, onlyAdmin, etc.)',
        codeSnippet: accessControlMatches[0],
        confidence: 75,
        cwe: 'CWE-284'
      });
    }

    // Check for timestamp dependence
    const timestampMatches = code.match(this.analysisPatterns.timestampDependence.pattern);
    if (timestampMatches) {
      vulnerabilities.push({
        id: `timestamp_${Date.now()}`,
        type: 'timestamp_dependence',
        severity: 'medium',
        title: 'Timestamp Dependence',
        description: 'Contract logic depends on block.timestamp',
        location: this.findLocation(code, timestampMatches[0]),
        impact: 'Miners can manipulate timestamps within a 15-second window',
        recommendation: 'Use block numbers instead of timestamps for time-dependent logic',
        codeSnippet: timestampMatches[0],
        confidence: 80,
        cwe: 'CWE-829'
      });
    }

    return vulnerabilities;
  }

  private findLocation(code: string, snippet: string): { line: number; column?: number; function?: string } {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(snippet)) {
        const functionMatch = this.findContainingFunction(code, i);
        return {
          line: i + 1,
          column: lines[i].indexOf(snippet) + 1,
          function: functionMatch
        };
      }
    }
    return { line: 1 };
  }

  private findContainingFunction(code: string, lineNumber: number): string | undefined {
    const lines = code.split('\n');
    for (let i = lineNumber; i >= 0; i--) {
      const functionMatch = lines[i].match(/function\s+(\w+)/);
      if (functionMatch) {
        return functionMatch[1];
      }
    }
    return undefined;
  }

  private calculateRiskScore(vulnerabilities: Vulnerability[]): number {
    let score = 0;
    const weights = {
      critical: 40,
      high: 25,
      medium: 15,
      low: 5,
      info: 1
    };

    vulnerabilities.forEach(vuln => {
      score += weights[vuln.severity] * (vuln.confidence / 100);
    });

    return Math.min(100, Math.round(score));
  }

  private generateRecommendations(vulnerabilities: Vulnerability[]) {
    return vulnerabilities.map(vuln => ({
      id: `rec_${vuln.id}`,
      category: 'security' as const,
      priority: vuln.severity === 'critical' || vuln.severity === 'high' ? 'high' as const : 'medium' as const,
      title: `Fix ${vuln.title}`,
      description: vuln.recommendation,
      implementation: this.getImplementationGuide(vuln.type),
      estimatedEffort: this.getEffortEstimate(vuln.severity)
    }));
  }

  private getImplementationGuide(type: string): string {
    const guides = {
      reentrancy: 'Implement the checks-effects-interactions pattern: 1) Check conditions, 2) Update state, 3) Interact with external contracts',
      unchecked_call: 'Add require() statements to check return values: require(target.call(data), "Call failed")',
      access_control: 'Add access control modifiers: modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }',
      timestamp_dependence: 'Replace block.timestamp with block.number for time-dependent logic'
    };
    return guides[type as keyof typeof guides] || 'Refer to security best practices documentation';
  }

  private getEffortEstimate(severity: string): 'low' | 'medium' | 'high' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  private checkPattern(code: string, patternName: string): any {
    const pattern = this.analysisPatterns[patternName as keyof typeof this.analysisPatterns];
    if (!pattern) return null;

    const matches = code.match(pattern.pattern);
    return {
      found: !!matches,
      count: matches?.length || 0,
      matches: matches || [],
      severity: pattern.severity,
      description: pattern.description
    };
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    console.log(`[${this.name}] ${level.toUpperCase()}: ${message}`);
  }
}
