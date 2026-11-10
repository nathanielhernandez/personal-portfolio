import { lazy, Suspense, type ComponentType } from 'react';

const loaders = import.meta.glob<{ default: ComponentType }>(
  '/src/lab/*/Demo.tsx',
);

const demos = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [
    path.split('/').at(-2),
    lazy(load),
  ]),
);

export default function LabDemo({ slug }: { slug: string }) {
  const Demo = demos[slug];

  return (
    <Suspense fallback={null}>
      <Demo />
    </Suspense>
  );
}
