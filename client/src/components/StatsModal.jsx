import React, { useEffect, useState, useRef } from "react";
import { fetchStats } from "../api";
import { SHORTLINK_BASE_URL } from "../config";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import styles from "./StatsModal.module.css";

const DEVICE_COLORS = { desktop: "#7c6af7", mobile: "#4ade80", tablet: "#fbbf24" };

export default function StatsModal({ urlId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  const shortLink = data ? `${SHORTLINK_BASE_URL}/${data.shortCode}` : "";

  useEffect(() => {
    fetchStats(urlId).then((r) => setData(r.data)).finally(() => setLoading(false));
  }, [urlId]);

  const chartData = React.useMemo(() => {
    if (!data?.clickHistory?.length) return [];
    const map = {};
    data.clickHistory.forEach(({ timestamp }) => {
      const d = new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([date, clicks]) => ({ date, clicks }));
  }, [data]);

  const deviceData = React.useMemo(() => {
    if (!data?.clickHistory?.length) return [];
    const map = { desktop: 0, mobile: 0, tablet: 0 };
    data.clickHistory.forEach(({ device }) => { if (map[device] !== undefined) map[device]++; });
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [data]);

  const referrerData = React.useMemo(() => {
    if (!data?.clickHistory?.length) return [];
    const map = {};
    data.clickHistory.forEach(({ referrer }) => {
      const key = referrer || "direct";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ref, count]) => ({ ref, count }));
  }, [data]);

  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${data.shortCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>
        <h2 className={styles.title}>Link Analytics</h2>

        {loading && <p className={styles.muted}>Loading stats...</p>}

        {data && (
          <>
            {/* Meta row */}
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.label}>Original URL</span>
                <a href={data.originalUrl} target="_blank" rel="noreferrer" className={styles.link}>
                  {data.originalUrl.length > 60 ? data.originalUrl.slice(0, 60) + "…" : data.originalUrl}
                </a>
              </div>
              <div className={styles.metaRow}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{data.clicks}</span>
                  <span className={styles.label}>Total Clicks</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{new Date(data.createdAt).toLocaleDateString()}</span>
                  <span className={styles.label}>Created</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum} style={{ color: data.expiresAt ? "var(--warning)" : "var(--success)" }}>
                    {data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "Never"}
                  </span>
                  <span className={styles.label}>Expires</span>
                </div>
                {data.password && (
                  <div className={styles.stat}>
                    <span className={styles.statNum}>🔒</span>
                    <span className={styles.label}>Protected</span>
                  </div>
                )}
              </div>
              {data.tags?.length > 0 && (
                <div className={styles.tagRow}>
                  {data.tags.map((t) => <span key={t} className={styles.tag}>#{t}</span>)}
                </div>
              )}
            </div>

            {/* Clicks over time */}
            {chartData.length > 0 ? (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clicks over time</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }} labelStyle={{ color: "var(--text)" }} itemStyle={{ color: "var(--accent)" }} />
                    <Bar dataKey="clicks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={styles.muted} style={{ marginTop: "1rem" }}>No clicks recorded yet.</p>
            )}

            {/* Device + Referrers row */}
            {data.clicks > 0 && (
              <div className={styles.twoCol}>
                {/* Device breakdown */}
                <div className={styles.section}>
                  <p className={styles.sectionTitle}>Device breakdown</p>
                  {deviceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {deviceData.map((entry) => (
                            <Cell key={entry.name} fill={DEVICE_COLORS[entry.name] || "#888"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className={styles.muted}>No data</p>}
                </div>

                {/* Top referrers */}
                <div className={styles.section}>
                  <p className={styles.sectionTitle}>Top referrers</p>
                  <div className={styles.referrerList}>
                    {referrerData.map(({ ref, count }) => (
                      <div key={ref} className={styles.referrerRow}>
                        <span className={styles.referrerName} title={ref}>
                          {ref === "direct" ? "🔗 Direct" : ref.length > 28 ? ref.slice(0, 28) + "…" : ref}
                        </span>
                        <span className={styles.referrerCount}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className={styles.section}>
              <p className={styles.sectionTitle}>QR Code</p>
              <div className={styles.qrArea}>
                <div ref={qrRef} className={styles.qrBox}>
                  <QRCodeCanvas value={shortLink} size={120} bgColor="#1a1a24" fgColor="#e8e8f0" />
                </div>
                <div className={styles.qrInfo}>
                  <p className={styles.qrLink}>{shortLink}</p>
                  <p className={styles.muted} style={{ fontSize: "0.8rem" }}>Scan to open the short link. Share or print this QR code anywhere.</p>
                  <button className={styles.downloadBtn} onClick={downloadQR}>⬇ Download QR</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
