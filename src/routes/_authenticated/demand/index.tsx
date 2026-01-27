import Layout from '@/components/Layout'
import Loader from '@/components/Loader';
import Menu from '@/components/Menu';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, UserSearch } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/demand/')({
  pendingComponent: () => <Loader />,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  const [_lastSelected, setLastSelected] = useState<string>('');

  const demandOptions = [
    { label: 'New Demand', path: '/new-demand', icon: Plus },
    { label: 'My Demand', path: '/my-demand', icon: UserSearch },  
  ];

  return (
    <Layout>
      <Menu 
        options={demandOptions}
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
