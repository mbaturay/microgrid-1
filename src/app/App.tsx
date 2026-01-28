import { RouterProvider } from 'react-router';
import { router } from '@/app/routes';
import { ProjectLensProvider } from '@/app/lib/ProjectLensContext';

export default function App() {
  return (
    <ProjectLensProvider>
      <RouterProvider router={router} />
    </ProjectLensProvider>
  );
}
