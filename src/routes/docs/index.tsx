import Layout from '@/components/Layout';
import Loader from '@/components/Loader'
import Menu from '@/components/Menu';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FileQuestion, Section } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/docs/')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const [_lastSelected, setLastSelected] = useState<string>('');

  const docsOptions = [
    { label: 'Guide', path: '/docs/guide', icon: FileQuestion },
    { label: 'Terms', path: '/docs/terms', icon: Section },
    { label: 'Privacy', path: '/docs/privacy', icon: Section }
  ]

  return (
    <Layout>
      <Menu 
        options={docsOptions}
        onSelect={(option, index) => {
        setLastSelected(`${option.label} (${index})`);
          if (option.path) {
            navigate({ to: option.path })
          }
        }}
      />
    </Layout>
  )
}
