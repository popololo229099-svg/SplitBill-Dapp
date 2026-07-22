import React from 'react';

const shimmerKeyframe = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

const shimmerBase: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1e2329 25%, #2b3139 50%, #1e2329 75%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 1.5s infinite linear',
  borderRadius: 6,
};

function SkeletonLine({ width, height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div style={{ ...shimmerBase, width: width ?? '100%', height, flexShrink: 0 }} />
  );
}

export function SkeletonCard({ lines = 3, gap = 12 }: { lines?: number; gap?: number }) {
  return (
    <>
      <style>{shimmerKeyframe}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} width={i === lines - 1 ? '60%' : undefined} />
        ))}
      </div>
    </>
  );
}

export function SkeletonBalance() {
  return (
    <>
      <style>{shimmerKeyframe}</style>
      <div style={{
        background: '#1e2329',
        borderRadius: 4,
        border: '1px solid #2b3139',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonLine width={80} height={10} />
          <SkeletonLine width={100} height={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <SkeletonLine width={60} height={10} />
          <SkeletonLine width={80} height={14} />
        </div>
      </div>
    </>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      <style>{shimmerKeyframe}</style>
      <div style={{
        background: '#1e2329', borderRadius: 8, border: '1px solid #2b3139', overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #2b3139' }}>
          <SkeletonLine width={60} height={10} />
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            padding: '10px 12px',
            borderBottom: i < count - 1 ? '1px solid #2b3139' : 'none',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <SkeletonLine width="40%" height={12} />
              <SkeletonLine width="25%" height={10} />
            </div>
            <SkeletonLine width={60} height={14} />
          </div>
        ))}
      </div>
    </>
  );
}
