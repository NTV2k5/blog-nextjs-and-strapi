'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, MessageSquare, Tag, TrendingUp,
  CheckCircle2, Clock, Loader2, AlertCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────
interface ReportStats {
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  totalCategories: number;
  postsThisMonth: number;
  postsLastMonth: number;
  recentPosts: { title: string; publishedAt: string | null; slug: string }[];
}

// ─── Helpers ─────────────────────────────────────
function calcGrowth(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '—';
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}%`;
}

function growthColor(current: number, previous: number) {
  if (previous === 0) return 'text-gray-400';
  return current >= previous ? 'text-emerald-400' : 'text-red-400';
}

// ─── Stat Card ───────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  bgClass,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  loading?: boolean;
}) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all flex flex-col gap-4">
      <div className={`inline-flex p-3 rounded-xl ${bgClass} w-fit`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      ) : (
        <>
          <p className="text-3xl font-black text-white">{value}</p>
          <p className="text-sm text-gray-400 -mt-2">{label}</p>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </>
      )}
    </div>
  );
}

// ─── Main Content ─────────────────────────────────
function ReportContent() {
  const { jwt } = useAuth();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    if (!jwt) return;
    setLoading(true);
    setError('');

    try {
      const base = process.env.NEXT_PUBLIC_STRAPI_URL;
      const headers = { Authorization: `Bearer ${jwt}` };

      // Date helpers
      const now = new Date();
      const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      const [
        publishedRes,
        draftRes,
        commentsRes,
        categoriesRes,
        thisMonthRes,
        lastMonthRes,
        recentRes,
      ] = await Promise.all([
        // Published posts
        fetch(`${base}/api/posts?filters[publishedAt][$notNull]=true&pagination[pageSize]=1`, { headers }),
        // Draft posts (no publishedAt)
        fetch(`${base}/api/posts?filters[publishedAt][$null]=true&pagination[pageSize]=1&status=draft`, { headers }),
        // Total comments
        fetch(`${base}/api/blog-comments?pagination[pageSize]=1`, { headers }),
        // Total categories
        fetch(`${base}/api/categories?pagination[pageSize]=1`, { headers }),
        // Posts published this month
        fetch(`${base}/api/posts?filters[publishedAt][$gte]=${startThisMonth}&pagination[pageSize]=1`, { headers }),
        // Posts published last month
        fetch(`${base}/api/posts?filters[publishedAt][$gte]=${startLastMonth}&filters[publishedAt][$lte]=${endLastMonth}&pagination[pageSize]=1`, { headers }),
        // 5 most recent posts
        fetch(`${base}/api/posts?populate[cover]=*&sort=createdAt:desc&pagination[pageSize]=5`, { headers }),
      ]);

      const [pub, draft, comments, cats, thisMonth, lastMonth, recent] = await Promise.all([
        publishedRes.json(),
        draftRes.json(),
        commentsRes.json(),
        categoriesRes.json(),
        thisMonthRes.json(),
        lastMonthRes.json(),
        recentRes.json(),
      ]);

      setStats({
        publishedPosts:  pub?.meta?.pagination?.total   ?? 0,
        draftPosts:      draft?.meta?.pagination?.total ?? 0,
        totalComments:   comments?.meta?.pagination?.total ?? 0,
        totalCategories: cats?.meta?.pagination?.total  ?? 0,
        postsThisMonth:  thisMonth?.meta?.pagination?.total ?? 0,
        postsLastMonth:  lastMonth?.meta?.pagination?.total ?? 0,
        recentPosts: (recent?.data ?? []).map((p: any) => ({
          title: p.title ?? p.attributes?.title ?? 'Untitled',
          publishedAt: p.publishedAt ?? p.attributes?.publishedAt ?? null,
          slug: p.slug ?? p.attributes?.slug ?? '',
        })),
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const growth     = stats ? calcGrowth(stats.postsThisMonth, stats.postsLastMonth) : '—';
  const growthCls  = stats ? growthColor(stats.postsThisMonth, stats.postsLastMonth) : 'text-gray-400';

  return (
    <div className="py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-400">Real-time overview of your platform metrics.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Articles Published"
          value={loading ? '' : (stats?.publishedPosts ?? 0)}
          icon={CheckCircle2}
          iconClass="text-emerald-400"
          bgClass="bg-emerald-500/10 border border-emerald-500/20"
          loading={loading}
        />
        <StatCard
          label="Drafts / Unpublished"
          value={loading ? '' : (stats?.draftPosts ?? 0)}
          icon={Clock}
          iconClass="text-amber-400"
          bgClass="bg-amber-500/10 border border-amber-500/20"
          loading={loading}
        />
        <StatCard
          label="Total Comments"
          value={loading ? '' : (stats?.totalComments ?? 0)}
          icon={MessageSquare}
          iconClass="text-blue-400"
          bgClass="bg-blue-500/10 border border-blue-500/20"
          loading={loading}
        />
        <StatCard
          label="Total Categories"
          value={loading ? '' : (stats?.totalCategories ?? 0)}
          icon={Tag}
          iconClass="text-purple-400"
          bgClass="bg-purple-500/10 border border-purple-500/20"
          loading={loading}
        />
      </div>

      {/* Monthly growth row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Posts This Month"
          value={loading ? '' : (stats?.postsThisMonth ?? 0)}
          icon={FileText}
          iconClass="text-sky-400"
          bgClass="bg-sky-500/10 border border-sky-500/20"
          loading={loading}
        />
        <StatCard
          label="Posts Last Month"
          value={loading ? '' : (stats?.postsLastMonth ?? 0)}
          icon={FileText}
          iconClass="text-gray-400"
          bgClass="bg-white/5 border border-white/10"
          loading={loading}
        />
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all flex flex-col gap-4">
          <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          ) : (
            <>
              <p className={`text-3xl font-black ${growthCls}`}>{growth}</p>
              <p className="text-sm text-gray-400 -mt-2">Growth vs Last Month</p>
              <p className="text-xs text-gray-500">
                {stats?.postsThisMonth ?? 0} vs {stats?.postsLastMonth ?? 0} posts
              </p>
            </>
          )}
        </div>
      </div>

      {/* Recent posts table */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4">Recent Posts</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-white/30" />
          </div>
        ) : stats?.recentPosts.length ? (
          <div className="divide-y divide-white/5">
            {stats.recentPosts.map((post, i) => (
              <div key={i} className="flex items-center justify-between py-3 gap-4">
                <p className="text-sm text-gray-200 truncate flex-grow">{post.title}</p>
                {post.publishedAt ? (
                  <span className="shrink-0 flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-400/20">
                    <CheckCircle2 size={10} />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="shrink-0 flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full text-xs font-medium border border-amber-400/20">
                    <Clock size={10} /> Draft
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/20 italic py-8">No posts yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────
export default function ReportPage() {
  return <ReportContent />;
}
