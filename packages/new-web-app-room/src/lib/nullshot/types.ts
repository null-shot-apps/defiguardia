// DeFiGuard AI - Nullshot MCP (Model Context Protocol) Types
// Compatible with NullShot Hacks Season 0 Track 1b requirements

export interface MCPMessage {
  id: string;
  type: 'request' | 'response' | 'notification';
  method?: string;
  params?: any;
  result?: any;
  error?: MCPError;
  timestamp: string;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPCapability {
  name: string;
  version: string;
  description: string;
  methods: string[];
}

// Base MCP Server class for DeFiGuard AI tools
export abstract class MCPServer {
  abstract name: string;
  abstract version: string;
  abstract description: string;
  abstract capabilities: MCPCapability[];

  abstract initialize(): Promise<void>;
  abstract handleRequest(message: MCPMessage): Promise<MCPMessage>;
  abstract shutdown(): Promise<void>;

  protected createResponse(id: string, result: any): MCPMessage {
    return {
      id,
      type: 'response',
      result,
      timestamp: new Date().toISOString(),
    };
  }

  protected createError(id: string, code: number, message: string, data?: any): MCPMessage {
    return {
      id,
      type: 'response',
      error: { code, message, data },
      timestamp: new Date().toISOString(),
    };
  }
}

// Base AI Agent class for orchestrating security analysis
export abstract class Agent {
  abstract name: string;
  abstract role: string;
  abstract capabilities: string[];

  abstract process(input: any): Promise<any>;
  abstract getStatus(): AgentStatus;

  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    console.log(`[${this.name}] ${level.toUpperCase()}: ${message}`);
  }
}

export interface AgentStatus {
  active: boolean;
  lastActivity: string;
  tasksCompleted: number;
  currentTask?: string;
}

// Smart Contract Analysis Types
export interface ContractAnalysisRequest {
  contractCode: string;
  contractName?: string;
  contractAddress?: string;
  chainId?: number;
  analysisType: 'full' | 'quick' | 'focused';
  focusAreas?: string[];
}

export interface ContractAnalysisResponse {
  analysisId: string;
  contractInfo: {
    name?: string;
    address?: string;
    chainId?: number;
    compiler?: string;
    optimization?: boolean;
  };
  vulnerabilities: Vulnerability[];
  riskScore: number;
  gasAnalysis: GasAnalysis;
  recommendations: Recommendation[];
  timestamp: string;
  analysisTime: number; // milliseconds
}

export interface Vulnerability {
  id: string;
  type: VulnerabilityType;
  severity: Severity;
  title: string;
  description: string;
  location: CodeLocation;
  impact: string;
  recommendation: string;
  codeSnippet: string;
  confidence: number;
  cwe?: string; // Common Weakness Enumeration
  references?: string[];
}

export type VulnerabilityType = 
  | 'reentrancy'
  | 'overflow'
  | 'underflow'
  | 'access_control'
  | 'timestamp_dependence'
  | 'unchecked_call'
  | 'denial_of_service'
  | 'front_running'
  | 'price_manipulation'
  | 'flash_loan_attack'
  | 'signature_replay'
  | 'weak_randomness'
  | 'uninitialized_storage'
  | 'delegatecall_injection';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface CodeLocation {
  line: number;
  column?: number;
  function?: string;
  contract?: string;
  startLine?: number;
  endLine?: number;
}

export interface GasAnalysis {
  estimatedGas: number;
  optimizations: GasOptimization[];
  inefficiencies: GasInefficiency[];
  score: number; // 0-100
}

export interface GasOptimization {
  type: string;
  description: string;
  location: CodeLocation;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GasInefficiency {
  type: string;
  description: string;
  location: CodeLocation;
  wastedGas: number;
}

export interface Recommendation {
  id: string;
  category: 'security' | 'gas' | 'best_practice' | 'maintainability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

// Blockchain Data Types
export interface BlockchainData {
  chainId: number;
  blockNumber: number;
  timestamp: number;
  transactions: TransactionData[];
  contracts: ContractData[];
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
  status: 'success' | 'failed';
  contractInteraction?: boolean;
}

export interface ContractData {
  address: string;
  name?: string;
  verified: boolean;
  compiler?: string;
  optimization?: boolean;
  creationTx?: string;
  creator?: string;
}

// DeFi Protocol Data Types
export interface DeFiProtocolData {
  protocolName: string;
  tvl: number; // Total Value Locked
  volume24h: number;
  fees24h: number;
  contracts: string[];
  riskFactors: string[];
  auditReports: AuditReport[];
}

export interface AuditReport {
  auditor: string;
  date: string;
  reportUrl: string;
  findings: number;
  riskLevel: Severity;
}

// Real-time Monitoring Types
export interface MonitoringEvent {
  id: string;
  type: 'transaction' | 'contract_call' | 'vulnerability_detected' | 'anomaly';
  contractAddress: string;
  chainId: number;
  timestamp: string;
  severity: Severity;
  description: string;
  data: any;
}

export interface MonitoringConfig {
  contractAddresses: string[];
  chainIds: number[];
  eventTypes: string[];
  alertThresholds: {
    gasUsage: number;
    valueTransfer: number;
    frequencyLimit: number;
  };
  notifications: {
    email?: string;
    webhook?: string;
    discord?: string;
  };
}

// NFT Certification Types
export interface SecurityCertificate {
  tokenId: string;
  contractAddress: string;
  chainId: number;
  auditScore: number;
  issueDate: string;
  expiryDate: string;
  auditor: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: CertificateAttribute[];
  };
}

export interface CertificateAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
}
