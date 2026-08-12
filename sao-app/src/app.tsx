import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import ScanPage from '@/pages/ScanPage/ScanPage';
import BillPage from '@/pages/BillPage/BillPage';
import MinePage from '@/pages/MinePage/MinePage';
import ResultDetailPage from '@/pages/ResultDetailPage/ResultDetailPage';
import { initPwa } from '@/lib/pwa';

export default function App() {
  useEffect(() => {
    initPwa();
  }, []);

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ScanPage />} />
          <Route path="bill" element={<BillPage />} />
          <Route path="mine" element={<MinePage />} />
          <Route path="result/:id" element={<ResultDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(210 7% 10%)',
            color: 'hsl(200 10% 92%)',
            border: '1px solid hsl(208 8% 18%)',
          },
        }}
      />
    </>
  );
}
