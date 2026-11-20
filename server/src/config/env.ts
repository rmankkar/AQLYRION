import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load root .env (canonical config), then server/.env for server-specific overrides
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

interface EnvConfig {
  adoOrgUrl: string;
  adoProject: string;
  adoPat: string;
  adoFieldBoardColumn: string;
  adoFieldDeployDate: string;
  adoFieldTargetDate: string;
  adoFieldGoLive: string;
  adoLinkType: string;
  adoIterationBasePath: string | undefined;
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  qaTeamEmails: string[];
  nvidiaNimApiKey: string | undefined;
  nvidiaNimBaseUrl: string;
  aiSummaryModel: string;
  aiSummaryEnabled: boolean;
  shareBaseUrl: string;
  shareRetentionDays: number;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env: EnvConfig = {
  adoOrgUrl: getRequiredEnv('ADO_ORG_URL'),
  adoProject: getRequiredEnv('ADO_PROJECT'),
  adoPat: getRequiredEnv('ADO_PAT'),
  adoFieldBoardColumn: getOptionalEnv('ADO_FIELD_BOARD_COLUMN', 'System.BoardColumn'),
  adoFieldDeployDate: getOptionalEnv('ADO_FIELD_DEPLOY_DATE', 'Custom.DeployDate'),
  adoFieldTargetDate: getOptionalEnv('ADO_FIELD_TARGET_DATE', 'Microsoft.VSTS.Scheduling.TargetDate'),
  adoFieldGoLive: getOptionalEnv('ADO_FIELD_GO_LIVE', 'Custom.GoLive'),
  adoLinkType: getOptionalEnv('ADO_LINK_TYPE', 'System.LinkTypes.Hierarchy-Forward'),
  adoIterationBasePath: process.env.ADO_ITERATION_BASE_PATH,
  port: parseInt(getOptionalEnv('PORT', '3001'), 10),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
  corsOrigin: getOptionalEnv('CORS_ORIGIN', 'http://localhost:5173'),
  qaTeamEmails: (process.env.QA_TEAM_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(e => e.length > 0),
  nvidiaNimApiKey: process.env.NVIDIA_NIM_API_KEY,
  nvidiaNimBaseUrl: getOptionalEnv('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
  aiSummaryModel: getOptionalEnv('AI_SUMMARY_MODEL', 'nvidia/nemotron-3-ultra-550b-a55b'),
  aiSummaryEnabled: !!(process.env.NVIDIA_NIM_API_KEY),
  shareBaseUrl: getOptionalEnv('SHARE_BASE_URL', 'http://localhost:5173'),
  shareRetentionDays: parseInt(getOptionalEnv('SHARE_RETENTION_DAYS', '7'), 10),
};

export function validateEnv(): void {
  try {
    // Validate URL format
    new URL(env.adoOrgUrl);
    // Validate port
    if (isNaN(env.port) || env.port < 1 || env.port > 65535) {
      throw new Error('Invalid PORT');
    }
  } catch (error) {
    throw new Error(`Invalid environment configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const fieldMappings = {
  boardColumn: env.adoFieldBoardColumn,
  deployDate: env.adoFieldDeployDate,
  targetDate: env.adoFieldTargetDate,
  goLive: env.adoFieldGoLive,
} as const;

/**
 * Extracts the relative path after "Global_Data_Project" from ADO_ITERATION_BASE_PATH
 * e.g., "Global_Data_Project\\Iteration\\SE\\PI22" -> "Iteration/SE/PI22"
 * e.g., "Global_Data_Project\\SE\\PI22" -> "SE/PI22"
 */
export function getIterationApiPath(): string | undefined {
  const basePath = env.adoIterationBasePath;
  if (!basePath) return undefined;

  // Find "Global_Data_Project" and get everything after it
  const marker = 'Global_Data_Project';
  const index = basePath.indexOf(marker);
  if (index === -1) return undefined;

  // Get the part after the marker
  const relativePath = basePath.substring(index + marker.length);

  // Convert backslashes to forward slashes, remove leading/trailing slashes
  return relativePath
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
}