import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: false,
    }
  )
}

// Enhanced utility functions for DNS Analyzer events
export const dnsAnalyzerEvents = {
  // Analysis Events
  startAnalysis: (domainName: string, fileSize: number) => {
    posthog.capture('dns_analysis_started', {
      domain: domainName,
      file_size_bytes: fileSize,
      timestamp: new Date().toISOString()
    })
  },

  completeAnalysis: (domainName: string, metrics: {
    recordCount: number,
    securityIssues: string[],
    cloudServices: string[],
    environments: string[],
    duration: number
  }) => {
    posthog.capture('dns_analysis_completed', {
      domain: domainName,
      record_count: metrics.recordCount,
      security_issues_count: metrics.securityIssues.length,
      security_issues_types: metrics.securityIssues,
      cloud_services_count: metrics.cloudServices.length,
      cloud_services_detected: metrics.cloudServices,
      environments_count: metrics.environments.length,
      environments_detected: metrics.environments,
      analysis_duration_ms: metrics.duration,
      timestamp: new Date().toISOString()
    })
  },

  // Record Type Events
  recordTypeDetected: (type: string, count: number) => {
    posthog.capture('record_type_detected', {
      record_type: type,
      count: count,
      timestamp: new Date().toISOString()
    })
  },

  // Security Events
  securityIssueDetected: (issueType: string, domain: string, severity: 'low' | 'medium' | 'high') => {
    posthog.capture('security_issue_detected', {
      issue_type: issueType,
      domain,
      severity,
      timestamp: new Date().toISOString()
    })
  },

  // Email Configuration Events
  emailConfigAnalyzed: (config: {
    hasSPF: boolean,
    hasDKIM: boolean,
    hasDMARC: boolean,
    mxRecordsCount: number
  }) => {
    posthog.capture('email_config_analyzed', {
      spf_present: config.hasSPF,
      dkim_present: config.hasDKIM,
      dmarc_present: config.hasDMARC,
      mx_records_count: config.mxRecordsCount,
      email_security_score: calculateEmailSecurityScore(config),
      timestamp: new Date().toISOString()
    })
  },

  // Cloud Service Events
  cloudServiceDetected: (service: string, integrationType: string) => {
    posthog.capture('cloud_service_detected', {
      service_provider: service,
      integration_type: integrationType,
      timestamp: new Date().toISOString()
    })
  },

  // Export Events
  exportReport: (format: string, metrics: {
    recordCount: number,
    fileSize: number,
    includedSections: string[]
  }) => {
    posthog.capture('report_exported', {
      format,
      record_count: metrics.recordCount,
      file_size_bytes: metrics.fileSize,
      included_sections: metrics.includedSections,
      timestamp: new Date().toISOString()
    })
  },

  // UI Interaction Events
  tabViewed: (tabName: string) => {
    posthog.capture('tab_viewed', {
      tab_name: tabName,
      timestamp: new Date().toISOString()
    })
  },

  filterApplied: (filterType: string, value: string) => {
    posthog.capture('filter_applied', {
      filter_type: filterType,
      filter_value: value,
      timestamp: new Date().toISOString()
    })
  },

  // Error Events
  errorOccurred: (errorType: string, message: string, context: any) => {
    posthog.capture('error_occurred', {
      error_type: errorType,
      error_message: message,
      context,
      timestamp: new Date().toISOString()
    })
  },

  // Input Validation Events
  inputValidation: (isValid: boolean, errorType?: string) => {
    posthog.capture('input_validation', {
      is_valid: isValid,
      error_type: errorType,
      timestamp: new Date().toISOString()
    })
  },

  // Record Parsing Events
  recordParsing: (success: boolean, lineCount: number, parseErrors?: string[]) => {
    posthog.capture('record_parsing', {
      success,
      line_count: lineCount,
      error_count: parseErrors?.length || 0,
      errors: parseErrors,
      timestamp: new Date().toISOString()
    })
  },

  // User Interaction Events
  userInteraction: (element: string, action: string, details?: any) => {
    posthog.capture('user_interaction', {
      element,
      action,
      details,
      timestamp: new Date().toISOString()
    })
  },

  // Feature Usage Events
  featureUsage: (featureName: string, successful: boolean, duration?: number) => {
    posthog.capture('feature_usage', {
      feature: featureName,
      successful,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    })
  },

  // Performance Metrics
  performanceMetric: (metricName: string, value: number, context?: any) => {
    posthog.capture('performance_metric', {
      metric: metricName,
      value,
      context,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper function to calculate email security score
function calculateEmailSecurityScore(config: {
  hasSPF: boolean,
  hasDKIM: boolean,
  hasDMARC: boolean,
  mxRecordsCount: number
}): number {
  let score = 0
  if (config.hasSPF) score += 33.33
  if (config.hasDKIM) score += 33.33
  if (config.hasDMARC) score += 33.34
  return Math.round(score)
}

export default posthog 