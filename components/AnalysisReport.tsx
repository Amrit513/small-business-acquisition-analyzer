import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { AnalysisResult } from "@/types/business";
import type { EvidenceMap } from "@/lib/evidence/provenance";
import { buildEvidenceReport } from "@/lib/reporting/evidence";

const styles = StyleSheet.create({
  page: { padding: 38, fontFamily: "Helvetica", color: "#10201d", fontSize: 9, lineHeight: 1.45 },
  header: { backgroundColor: "#092f2a", color: "#ffffff", padding: 24, borderRadius: 8, marginBottom: 20 },
  eyebrow: { fontSize: 7, letterSpacing: 1.5, color: "#9de9d7", textTransform: "uppercase", marginBottom: 7 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  subtitle: { color: "#c6ded8", fontSize: 9 },
  grid: { flexDirection: "row", gap: 8, marginBottom: 18 },
  metric: { flex: 1, border: "1px solid #dce6e3", borderRadius: 6, padding: 10 },
  metricLabel: { fontSize: 6.5, color: "#667b75", textTransform: "uppercase", letterSpacing: .7, marginBottom: 5 },
  metricValue: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 9, color: "#0a5c4f" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: "1px solid #edf1f0" },
  label: { color: "#60706c" },
  value: { fontFamily: "Helvetica-Bold" },
  scoreRow: { marginBottom: 8 },
  scoreLabel: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  track: { height: 5, backgroundColor: "#e7eeec", borderRadius: 3 },
  bar: { height: 5, backgroundColor: "#0a7664", borderRadius: 3 },
  disclaimer: { marginTop: "auto", paddingTop: 16, borderTop: "1px solid #dce6e3", color: "#71817d", fontSize: 7 },
});

const usd = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

export function AnalysisReport({ analysis, evidence }: { analysis: AnalysisResult; evidence?: EvidenceMap }) {
  const scores = [
    ["Debt coverage", analysis.score.dscrScore], ["Cash-on-cash ROI", analysis.score.roiScore],
    ["Payback period", analysis.score.paybackScore], ["Growth and margin", analysis.score.growthScore],
    ["Valuation", analysis.score.valuationScore],
  ] as const;
  const evidenceRows = buildEvidenceReport(evidence);
  return <Document title={`${analysis.businessName} Acquisition Analysis`} author="Acquisition Lens">
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}><Text style={styles.eyebrow}>Acquisition Lens · Investment Memo</Text><Text style={styles.title}>{analysis.businessName}</Text><Text style={styles.subtitle}>{analysis.inputs.industry.replace("-", " ")} · Generated {new Date(analysis.createdAt).toLocaleDateString("en-US")}</Text></View>
      <View style={styles.grid}><Metric label="Acquisition score" value={`${analysis.score.totalScore}/100`} /><Metric label="Modeled valuation" value={usd(analysis.valuation.blendedEstimate)} /><Metric label="Cash-on-cash ROI" value={pct(analysis.returns.cashOnCashROI)} /><Metric label="DSCR" value={`${analysis.dscr.dscr.toFixed(2)}x`} /></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Deal economics</Text><ReportRow label="Asking price" value={usd(analysis.inputs.purchasePrice)} /><ReportRow label="Annual revenue" value={usd(analysis.inputs.annualRevenue)} /><ReportRow label="Seller discretionary earnings" value={usd(analysis.inputs.sde)} /><ReportRow label="Total buyer cash invested" value={usd(analysis.returns.totalCashInvested)} /><ReportRow label="Annual debt service" value={usd(analysis.loan.annualDebtService)} /><ReportRow label="Annual cash flow after debt" value={usd(analysis.cashFlow.annualCashFlowAfterDebt)} /><ReportRow label="Payback period" value={Number.isFinite(analysis.returns.paybackPeriodYears) ? `${analysis.returns.paybackPeriodYears.toFixed(1)} years` : "Not reached"} /></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Transparent score breakdown</Text>{scores.map(([label, score]) => <View key={label} style={styles.scoreRow}><View style={styles.scoreLabel}><Text>{label}</Text><Text>{score}/100</Text></View><View style={styles.track}><View style={[styles.bar, { width: `${score}%` }]} /></View></View>)}</View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Valuation cross-check</Text><ReportRow label="SDE method" value={usd(analysis.valuation.sdeMethod)} /><ReportRow label="EBITDA method" value={usd(analysis.valuation.ebitdaMethod)} /><ReportRow label="Revenue method" value={usd(analysis.valuation.revenueMethod)} /><ReportRow label="Blended estimate" value={usd(analysis.valuation.blendedEstimate)} /></View>
      <View style={styles.section} wrap={false}><Text style={styles.sectionTitle}>Evidence quality</Text>{evidenceRows.map((row) => <ReportRow key={row.field} label={row.label} value={`${row.sourceLabel}${row.needsVerification ? " · Verify" : ""}`} />)}<Text style={{ marginTop: 7, color: "#71817d", fontSize: 7 }}>Source labels are selected by the user and are not independent authentication. Verify material claims against original documents before making an investment decision.</Text></View>
      <Text style={styles.disclaimer}>Educational screening estimate only. This report is not an appraisal, investment recommendation, or substitute for accounting, legal, lending, and operational due diligence. All results depend on user-provided inputs.</Text>
    </Page>
  </Document>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function ReportRow({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
