export interface ComputedDiagnosticDetails {
  fieldKey: string;
  expression: string;
  message: string;
  symbol?: string;
}

export function extractComputedDiagnosticSymbol(message: string): string | undefined {
  return message.match(/:\s*([A-Za-z_$][\w$.-]*)/)?.[1];
}
