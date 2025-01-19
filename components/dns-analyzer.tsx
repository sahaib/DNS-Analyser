"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Copy, Terminal, Shield, Cloud, Mail, Server, FileDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AnimatedCard, CardBody } from "@/components/ui/animated-card"
import { Spotlight } from "@/components/ui/spotlight"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { dnsAnalyzerEvents } from '@/lib/posthog'

interface DNSRecord {
  name: string
  ttl: number
  class: string
  type: string
  value: string
  findings: string[]
  recordCategory: string
}

interface AnalysisResult {
  records: DNSRecord[]
  recordCounts: Record<string, number>
  cloudServices: string[]
  securityIssues: string[]
  environments: string[]
  recommendations: string[]
  emailConfig: {
    hasSPF: boolean
    hasDKIM: boolean
    hasDMARC: boolean
    mxRecords: string[]
  }
  unusualTTLs: string[]
  serviceMapping: {
    name: string
    type: string
    target: string
  }[]
}

export function DnsAnalyzer() {
  const [zoneFile, setZoneFile] = useState("")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeDns = async () => {
    const startTime = performance.now();
    setIsAnalyzing(true)
    
    // Validate input
    if (!zoneFile.trim()) {
      dnsAnalyzerEvents.inputValidation(false, 'empty_input');
      return;
    }

    // Track analysis start with file size
    dnsAnalyzerEvents.startAnalysis(
      zoneFile.split('\n')[0],
      new Blob([zoneFile]).size
    )
    
    // Parse the zone file
    const lines = zoneFile.split('\n')
    const records: DNSRecord[] = []
    const parseErrors: string[] = []
    
    lines.forEach((line, index) => {
      if (line.trim() && !line.startsWith(';')) {
        const parts = line.split(/\s+/)
        try {
          if (parts.length >= 5) {
            const record: DNSRecord = {
              name: parts[0],
              ttl: parseInt(parts[1]),
              class: parts[2],
              type: parts[3],
              value: parts.slice(4).join(' '),
              findings: [],
              recordCategory: categorizeRecord(parts[3], parts[0], parts.slice(4).join(' '))
            }
            record.findings = analyzeRecord(record)
            records.push(record)
          } else {
            parseErrors.push(`Line ${index + 1}: Invalid record format`)
          }
        } catch (error: any) {
          parseErrors.push(`Line ${index + 1}: ${error.message}`)
        }
      }
    })

    // Track parsing results
    dnsAnalyzerEvents.recordParsing(parseErrors.length === 0, lines.length, parseErrors)

    // Analyze records
    const analysis: AnalysisResult = {
      records,
      recordCounts: countRecordTypes(records),
      cloudServices: detectCloudServices(records),
      securityIssues: detectSecurityIssues(records),
      environments: detectEnvironments(records),
      recommendations: generateRecommendations(records),
      emailConfig: analyzeEmailConfig(records),
      unusualTTLs: detectUnusualTTLs(records),
      serviceMapping: mapServices(records)
    }
    
    // Track record types
    Object.entries(analysis.recordCounts).forEach(([type, count]) => {
      dnsAnalyzerEvents.recordTypeDetected(type, count)
    })

    // Track security issues
    analysis.securityIssues.forEach(issue => {
      const severity = determineSeverity(issue)
      dnsAnalyzerEvents.securityIssueDetected(issue, zoneFile.split('\n')[0], severity)
    })

    // Track email configuration
    dnsAnalyzerEvents.emailConfigAnalyzed({
      hasSPF: analysis.emailConfig.hasSPF,
      hasDKIM: analysis.emailConfig.hasDKIM,
      hasDMARC: analysis.emailConfig.hasDMARC,
      mxRecordsCount: analysis.emailConfig.mxRecords.length
    })

    // Track cloud services
    analysis.cloudServices.forEach(service => {
      dnsAnalyzerEvents.cloudServiceDetected(service, 'DNS')
    })

    // Track performance metric
    dnsAnalyzerEvents.performanceMetric('analysis_duration', performance.now() - startTime, {
      record_count: records.length,
      error_count: parseErrors.length
    })

    setAnalysis(analysis)
    setIsAnalyzing(false)
  }

  const handleExport = () => {
    if (!analysis) return;

    const startTime = performance.now();
    const csvContent = generateCSV(analysis);
    
    try {
      // Track export with enhanced metrics
      dnsAnalyzerEvents.exportReport('csv', {
        recordCount: analysis.records.length,
        fileSize: new Blob([csvContent]).size,
        includedSections: ['records', 'security', 'email', 'cloud']
      })

      // Track feature usage
      dnsAnalyzerEvents.featureUsage('export_csv', true, performance.now() - startTime)

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dns-records-analysis.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      dnsAnalyzerEvents.errorOccurred('export_error', error.message, {
        recordCount: analysis.records.length
      })
    }
  };

  // Track tab views with more context
  const handleTabChange = (tab: string) => {
    dnsAnalyzerEvents.tabViewed(tab)
    dnsAnalyzerEvents.userInteraction('tab_navigation', 'view', {
      tab,
      hasAnalysis: !!analysis,
      recordCount: analysis?.records.length
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <BackgroundGradient className="p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >

          </motion.div>

          <Spotlight className="rounded-3xl border border-white/10">
            <Card className="w-full overflow-hidden bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="relative w-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-white/10">
                  {/* Terminal header */}
                  <div className="h-8 w-full bg-[#2D2D2D] flex items-center px-4 border-b border-white/10">
                    <div className="flex gap-2 items-center">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="ml-4 text-xs text-white/40">DNS Zone File</span>
                  </div>
                  
                  {/* Terminal content */}
                  <div className="relative">
                    <textarea
                      value={zoneFile}
                      onChange={(e) => setZoneFile(e.target.value)}
                      className="w-full h-[200px] bg-transparent text-white font-mono text-sm p-4 border-none focus:outline-none focus:ring-0 resize-none"
                      placeholder="; Paste your DNS zone file here..."
                      spellCheck="false"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => navigator.clipboard.writeText(zoneFile)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button 
                    size="sm"
                    onClick={analyzeDns}
                    disabled={!zoneFile || isAnalyzing}
                    className="bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 text-white"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze DNS"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExport}
                    className="flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Export Report
                  </Button>
                </div>

                <AnimatePresence>
                  {analysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
                        <TabsList className="w-full justify-start bg-white/5 border-b border-white/10">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="records">Records</TabsTrigger>
                          <TabsTrigger value="security">Security</TabsTrigger>
                          <TabsTrigger value="email">Email</TabsTrigger>
                          <TabsTrigger value="cloud">Cloud Services</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview">
                          <ScrollArea className="h-[600px] rounded-md">
                            <div className="space-y-6 p-4">
                              <AnalysisSummary analysis={analysis} />
                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Record Types</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {Object.entries(analysis.recordCounts).map(([type, count]) => (
                                    <AnimatedCard key={type} className="h-full">
                                      <CardBody className="bg-white/5 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-white">{count}</div>
                                        <div className="text-sm text-white/60">{type} Records</div>
                                      </CardBody>
                                    </AnimatedCard>
                                  ))}
                                </div>
                              </section>
                              
                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Environments</h3>
                                <div className="grid gap-2">
                                  {analysis.environments.map((env) => (
                                    <Spotlight key={env}>
                                      <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2 text-white">
                                        <Server className="w-4 h-4" />
                                        {env}
                                      </div>
                                    </Spotlight>
                                  ))}
                                </div>
                              </section>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="records">
                          <ScrollArea className="h-[600px] rounded-md">
                            <div className="p-4">
                              <RecordsTable records={analysis.records} />
                            </div>
                          </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="security">
                          <ScrollArea className="h-[600px] rounded-md">
                            <div className="space-y-4 p-4">
                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Security Issues</h3>
                                {analysis.securityIssues.map((issue, i) => (
                                  <AnimatedCard key={i} className="mb-2">
                                    <CardBody>
                                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <AlertDescription className="text-white">
                                          {issue}
                                        </AlertDescription>
                                      </Alert>
                                    </CardBody>
                                  </AnimatedCard>
                                ))}
                              </section>

                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Unusual TTL Values</h3>
                                {analysis.unusualTTLs.map((ttl, i) => (
                                  <AnimatedCard key={i} className="mb-2">
                                    <CardBody>
                                      <Alert className="bg-yellow-500/10 border-yellow-500/20">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                        <AlertDescription className="text-white">
                                          {ttl}
                                        </AlertDescription>
                                      </Alert>
                                    </CardBody>
                                  </AnimatedCard>
                                ))}
                              </section>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="email">
                          <ScrollArea className="h-[600px] rounded-md">
                            <div className="space-y-4 p-4">
                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Email Configuration</h3>
                                <div className="grid gap-2">
                                  <AnimatedCard>
                                    <CardBody>
                                      <Alert className={`${analysis.emailConfig.hasSPF ? 'bg-green-500/10' : 'bg-red-500/10'} border-0`}>
                                        {analysis.emailConfig.hasSPF ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-red-500" />
                                        )}
                                        <AlertDescription className="text-white">
                                          SPF Record {analysis.emailConfig.hasSPF ? 'Present' : 'Missing'}
                                        </AlertDescription>
                                      </Alert>
                                    </CardBody>
                                  </AnimatedCard>
                                  
                                  <AnimatedCard>
                                    <CardBody>
                                      <Alert className={`${analysis.emailConfig.hasDKIM ? 'bg-green-500/10' : 'bg-red-500/10'} border-0`}>
                                        {analysis.emailConfig.hasDKIM ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-red-500" />
                                        )}
                                        <AlertDescription className="text-white">
                                          DKIM Records {analysis.emailConfig.hasDKIM ? 'Present' : 'Missing'}
                                        </AlertDescription>
                                      </Alert>
                                    </CardBody>
                                  </AnimatedCard>
                                  
                                  <AnimatedCard>
                                    <CardBody>
                                      <Alert className={`${analysis.emailConfig.hasDMARC ? 'bg-green-500/10' : 'bg-red-500/10'} border-0`}>
                                        {analysis.emailConfig.hasDMARC ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <AlertTriangle className="w-4 h-4 text-red-500" />
                                        )}
                                        <AlertDescription className="text-white">
                                          DMARC Record {analysis.emailConfig.hasDMARC ? 'Present' : 'Missing'}
                                        </AlertDescription>
                                      </Alert>
                                    </CardBody>
                                  </AnimatedCard>
                                </div>
                              </section>

                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">MX Records</h3>
                                <div className="space-y-2">
                                  {analysis.emailConfig.mxRecords.map((mx, i) => (
                                    <Spotlight key={i}>
                                      <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2 text-white">
                                        <Mail className="w-4 h-4" />
                                        {mx}
                                      </div>
                                    </Spotlight>
                                  ))}
                                </div>
                              </section>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="cloud">
                          <ScrollArea className="h-[600px] rounded-md">
                            <div className="space-y-4 p-4">
                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Cloud Services</h3>
                                {analysis.cloudServices.map((service, i) => (
                                  <AnimatedCard key={i} className="mb-2">
                                    <CardBody>
                                      <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2 text-white">
                                        <Cloud className="w-4 h-4" />
                                        {service}
                                      </div>
                                    </CardBody>
                                  </AnimatedCard>
                                ))}
                              </section>

                              <section>
                                <h3 className="text-lg font-semibold text-white mb-4">Service Mapping</h3>
                                {analysis.serviceMapping.map((service, i) => (
                                  <Spotlight key={i}>
                                    <div className="bg-white/5 rounded-lg p-3 mb-2">
                                      <div className="text-sm font-medium text-white">{service.name}</div>
                                      <div className="text-sm text-white/60">{service.type} → {service.target}</div>
                                    </div>
                                  </Spotlight>
                                ))}
                              </section>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </Spotlight>
        </div>
      </BackgroundGradient>
    </motion.div>
  )
}

function AnalysisSummary({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Analysis Summary</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatedCard>
          <CardBody className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">Total Records</h4>
            <p className="text-2xl font-bold text-white">{analysis.records.length}</p>
          </CardBody>
        </AnimatedCard>
        <AnimatedCard>
          <CardBody className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">Record Types</h4>
            <p className="text-2xl font-bold text-white">{Object.keys(analysis.recordCounts).length}</p>
          </CardBody>
        </AnimatedCard>
        <AnimatedCard>
          <CardBody className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">Environments</h4>
            <p className="text-2xl font-bold text-white">{analysis.environments.length}</p>
          </CardBody>
        </AnimatedCard>
        <AnimatedCard>
          <CardBody className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">Security Issues</h4>
            <p className="text-2xl font-bold text-white">{analysis.securityIssues.length}</p>
          </CardBody>
        </AnimatedCard>
      </div>
    </section>
  )
}

function RecordsTable({ records }: { records: DNSRecord[] }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[1200px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white w-[200px]">Name</TableHead>
              <TableHead className="text-white w-[100px]">TTL</TableHead>
              <TableHead className="text-white w-[100px]">Type</TableHead>
              <TableHead className="text-white w-[250px]">Value</TableHead>
              <TableHead className="text-white w-[250px]">Purpose</TableHead>
              <TableHead className="text-white w-[150px]">Security</TableHead>
              <TableHead className="text-white w-[250px]">Analysis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-white">{record.name}</TableCell>
                <TableCell className="text-white">{record.ttl}</TableCell>
                <TableCell className="text-white">{record.type}</TableCell>
                <TableCell className="text-white break-all">{record.value}</TableCell>
                <TableCell className="text-white">
                  {getRecordPurpose(record.type, record.name, record.value)}
                </TableCell>
                <TableCell>
                  {getSecurityStatus(record)}
                </TableCell>
                <TableCell className="text-white text-sm">
                  {getDetailedAnalysis(record)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function countRecordTypes(records: DNSRecord[]): Record<string, number> {
  const counts: Record<string, number> = {}
  records.forEach(record => {
    counts[record.type] = (counts[record.type] || 0) + 1
  })
  return counts
}

function detectCloudServices(records: DNSRecord[]): string[] {
  const services = new Set<string>()
  records.forEach(record => {
    if (record.value?.includes('amazonaws.com')) services.add('Amazon AWS')
    if (record.value?.includes('cloudfront.net')) services.add('Amazon CloudFront')
    if (record.value?.includes('azure.com')) services.add('Microsoft Azure')
    if (record.value?.includes('googleusercontent.com')) services.add('Google Cloud')
  })
  return Array.from(services)
}

function detectSecurityIssues(records: DNSRecord[]): string[] {
  const issues: string[] = []
  
  // Check for wildcard records
  if (records.some(r => r.name.includes('*'))) {
    issues.push('Wildcard DNS entries detected - potential security risk')
  }

  // Check for internal endpoints
  if (records.some(r => r.value?.includes('internal'))) {
    issues.push('Internal service endpoints exposed in public DNS')
  }

  // Check for development environments
  if (records.some(r => r.name.includes('dev') || r.name.includes('test'))) {
    issues.push('Development/Test environments detected in production DNS')
  }

  return issues
}

function detectEnvironments(records: DNSRecord[]): string[] {
  const envs = new Set<string>()
  records.forEach(record => {
    if (record.name.includes('prod')) envs.add('Production')
    if (record.name.includes('dev')) envs.add('Development')
    if (record.name.includes('stage') || record.name.includes('staging')) envs.add('Staging')
    if (record.name.includes('qa')) envs.add('QA')
    if (record.name.includes('test')) envs.add('Testing')
  })
  return Array.from(envs)
}

function analyzeEmailConfig(records: DNSRecord[]): any {
  return {
    hasSPF: records.some(r => r.value?.includes('v=spf1')),
    hasDKIM: records.some(r => r.name.includes('_domainkey')),
    hasDMARC: records.some(r => r.name === '_dmarc'),
    mxRecords: records
      .filter(r => r.type === 'MX')
      .map(r => r.value)
      .filter(Boolean)
  }
}

function detectUnusualTTLs(records: DNSRecord[]): string[] {
  const issues: string[] = []
  records.forEach(record => {
    if (record.ttl === 666) {
      issues.push(`Unusual TTL value (666) found for ${record.name}`)
    }
    if (record.ttl < 300) {
      issues.push(`Very low TTL value (${record.ttl}) found for ${record.name}`)
    }
  })
  return issues
}

function mapServices(records: DNSRecord[]): any[] {
  return records
    .filter(r => r.type === 'CNAME' && r.value)
    .map(r => ({
      name: r.name,
      type: 'CNAME',
      target: r.value
    }))
    .slice(0, 10) // Limit to first 10 for display
}

function generateRecommendations(records: DNSRecord[]): string[] {
  const recs = [
    "Implement DNSSEC for enhanced security",
    "Use CAA records to restrict certificate authorities",
    "Regular audit of DNS TTL values"
  ]
  
  if (!records.some(r => r.name === '_dmarc')) {
    recs.push("Add DMARC record for improved email security")
  }
  
  if (records.some(r => r.ttl === 666)) {
    recs.push("Standardize TTL values across records")
  }
  
  return recs
}

function categorizeRecord(type: string, name: string, value: string): string {
  if (type === 'MX') {
    if (value.includes('google')) return 'Google Workspace'
    if (value.includes('amazonses')) return 'Amazon SES'
    return 'Email'
  }
  if (name.includes('_dmarc')) return 'DMARC'
  if (name.includes('_domainkey')) return 'DKIM'
  if (type === 'TXT' && value.includes('v=spf1')) return 'SPF'
  if (type === 'A' || type === 'AAAA') {
    if (name.includes('qa')) return 'QA Host'
    if (name.includes('staging')) return 'Staging Host'
    if (name.includes('prod')) return 'Production Host'
    return 'Host'
  }
  if (type === 'CNAME') {
    if (value.includes('amazonaws.com')) return 'AWS Alias'
    if (value.includes('azure.com')) return 'Azure Alias'
    if (value.includes('googleusercontent')) return 'Google Cloud Alias'
    return 'Alias'
  }
  if (type === 'NS') return 'Nameserver'
  return type
}

function analyzeRecord(record: DNSRecord): string[] {
  const findings: string[] = []
  
  // TTL Analysis
  if (record.ttl < 300) findings.push('Very low TTL - Consider increasing')
  if (record.ttl === 666) findings.push('Non-standard TTL value')
  if (record.ttl > 86400) findings.push('Unusually high TTL')
  
  // Email Configuration
  if (record.type === 'MX') {
    if (record.value.includes('google')) findings.push('Google Workspace')
    if (record.value.includes('amazonses')) findings.push('Amazon SES')
    if (parseInt(record.value.split(' ')[0]) === 0) findings.push('Primary MX')
  }
  
  // Security Analysis
  if (record.name.includes('*')) findings.push('Wildcard record - Security risk')
  if (record.type === 'TXT') {
    if (record.value.includes('v=spf1')) findings.push('SPF Record')
    if (record.value.includes('v=DMARC1')) findings.push('DMARC Record')
  }
  if (record.name.includes('_domainkey')) findings.push('DKIM Record')
  
  // Environment Detection
  if (record.name.includes('qa')) findings.push('QA Environment')
  if (record.name.includes('staging')) findings.push('Staging Environment')
  if (record.name.includes('prod')) findings.push('Production Environment')
  
  // Cloud Service Detection
  if (record.value.includes('amazonaws.com')) findings.push('AWS Service')
  if (record.value.includes('azure.com')) findings.push('Azure Service')
  if (record.value.includes('googleusercontent')) findings.push('Google Cloud')
  if (record.value.includes('cloudfront.net')) findings.push('CloudFront CDN')
  
  // IP Analysis
  if (record.type === 'A' || record.type === 'AAAA') {
    if (record.value.startsWith('10.') || 
        record.value.startsWith('172.16.') || 
        record.value.startsWith('192.168.')) {
      findings.push('Internal IP exposed')
    }
  }

  return findings
}

function getRecordPurpose(type: string, name: string, value: string): string {
  switch (type) {
    case 'A':
      return 'Maps domain name to IPv4 address - Used for direct host addressing'
    case 'AAAA':
      return 'Maps domain name to IPv6 address - Used for next-gen IP addressing'
    case 'MX':
      if (value.includes('google')) return 'Google Workspace email handling'
      if (value.includes('amazonses')) return 'Amazon SES email handling'
      return 'Mail server configuration - Handles email routing'
    case 'CNAME':
      if (value.includes('amazonaws')) return 'AWS service alias'
      if (value.includes('azure')) return 'Azure service alias'
      if (value.includes('google')) return 'Google service alias'
      return 'Domain alias - Points to another domain name'
    case 'TXT':
      if (value.includes('v=spf1')) return 'SPF Record - Email sender policy'
      if (name === '_dmarc') return 'DMARC Policy - Email authentication'
      if (name.includes('_domainkey')) return 'DKIM - Email signing configuration'
      return 'Text record - Domain verification or policy'
    case 'NS':
      return 'Nameserver - Controls DNS resolution chain'
    case 'SOA':
      return 'Start of Authority - Primary DNS zone info'
    default:
      return `${type} record - Basic DNS configuration`
  }
}

function getSecurityStatus(record: DNSRecord): JSX.Element {
  const issues: string[] = []
  let severity: 'low' | 'medium' | 'high' = 'low'

  // Check for security issues
  if (record.name.includes('*')) {
    issues.push('Wildcard record poses security risk')
    severity = 'high'
  }
  if (record.ttl < 300) {
    issues.push('Very low TTL may indicate DNS hijacking')
    severity = 'medium'
  }
  if (record.type === 'A' && (
    record.value.startsWith('10.') ||
    record.value.startsWith('172.16.') ||
    record.value.startsWith('192.168.')
  )) {
    issues.push('Internal IP exposed')
    severity = 'high'
  }
  if (record.name.includes('dev') || record.name.includes('staging')) {
    issues.push('Non-production environment exposed')
    severity = 'medium'
  }

  const colors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  }

  return (
    <div className="space-y-1">
      <div className={colors[severity]}>
        {issues.length === 0 ? 'Safe' : `Risk Level: ${severity}`}
      </div>
      {issues.map((issue, i) => (
        <div key={i} className="text-sm text-white/60">{issue}</div>
      ))}
    </div>
  )
}

function getDetailedAnalysis(record: DNSRecord): string {
  let analysis = ''

  // Basic record info
  if (record.type === 'A' || record.type === 'AAAA') {
    analysis = `This record points ${record.name} to ${record.value}. `
    if (record.name === '@' || record.name === '') {
      analysis += 'This is the main domain IP address. '
    }
  }

  // MX specific
  if (record.type === 'MX') {
    const priority = record.value.split(' ')[0]
    const server = record.value.split(' ')[1]
    analysis = `Email server priority ${priority} pointing to ${server}. `
    if (priority === '10') {
      analysis += 'This is likely the primary mail server. '
    }
  }

  // CNAME analysis
  if (record.type === 'CNAME') {
    analysis = `Alias record pointing to ${record.value}. `
    if (record.value.includes('amazonaws')) {
      analysis += 'This is an AWS service integration. '
    } else if (record.value.includes('azure')) {
      analysis += 'This is an Azure service integration. '
    }
  }

  // TXT record analysis
  if (record.type === 'TXT') {
    if (record.value.includes('v=spf1')) {
      analysis = 'SPF record defining authorized email senders. '
      if (record.value.includes('-all')) {
        analysis += 'Strict SPF policy enforced. '
      } else if (record.value.includes('~all')) {
        analysis += 'Soft SPF policy (recommended). '
      }
    }
    if (record.name === '_dmarc') {
      analysis = 'DMARC policy for email authentication. '
      if (record.value.includes('p=reject')) {
        analysis += 'Strict rejection policy for failed authentication. '
      }
    }
  }

  // TTL analysis
  if (record.ttl < 300) {
    analysis += 'Warning: Very low TTL value. '
  } else if (record.ttl > 86400) {
    analysis += 'Note: High TTL value may slow down DNS changes. '
  }

  return analysis.trim()
}

// Helper function to determine security issue severity
function determineSeverity(issue: string): 'low' | 'medium' | 'high' {
  if (issue.includes('exposed') || issue.includes('risk')) return 'high'
  if (issue.includes('unusual') || issue.includes('misconfigured')) return 'medium'
  return 'low'
}

// Helper function to generate CSV content
function generateCSV(analysis: AnalysisResult): string {
  const csvRows = [
    ['Name', 'TTL', 'Type', 'Value', 'Purpose', 'Security Status', 'Analysis'].join(',')
  ];

  // Add record data
  analysis.records.forEach(record => {
    const securityStatus = record.findings.length > 0 
      ? record.findings.join('; ') 
      : 'Safe';

    csvRows.push([
      record.name,
      record.ttl,
      record.type,
      record.value,
      getRecordPurpose(record.type, record.name, record.value),
      securityStatus,
      getDetailedAnalysis(record)
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
  });

  return csvRows.join('\n');
}

